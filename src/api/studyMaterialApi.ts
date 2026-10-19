import { apiFetch, getApiUrl } from './http';
import { getAccessToken } from '../auth/authSession';

import type {
    StudyMaterial,
    GenerateStudyMaterialResponse,
    RegenerateSummaryResponse,
    RegenerateMindMapResponse,
    RegenerateFlashcardsResponse
} from '../types/studyMaterial';


export function getStudyMaterial(
    videoId: string,
    signal?: AbortSignal
) {

    return apiFetch<StudyMaterial>(
        `/library/videos/${videoId}/study-material`,
        {
            signal
        }
    );
}


export function generateStudyMaterial(
    videoId: string
) {

    return apiFetch<GenerateStudyMaterialResponse>(
        `/library/videos/${videoId}/study-material/generate`,
        {
            method: 'POST'
        }
    );
}


export function regenerateSummary(
    videoId: string
) {

    return apiFetch<RegenerateSummaryResponse>(
        `/library/videos/${videoId}/study-material/summary/regenerate`,
        {
            method: 'POST'
        }
    );
}


export function regenerateMindMap(
    videoId: string
) {

    return apiFetch<RegenerateMindMapResponse>(
        `/library/videos/${videoId}/study-material/mind-map/regenerate`,
        {
            method: 'POST'
        }
    );
}


export function regenerateFlashcards(
    videoId: string
) {

    return apiFetch<RegenerateFlashcardsResponse>(
        `/library/videos/${videoId}/study-material/flashcards/regenerate`,
        {
            method: 'POST'
        }
    );
}

/** Resposta do endpoint exclusivo de imagem para cada vídeo. */
export interface VideoImage {
    videoId: string;
    imageUrl: string | null;
    updatedAt: string | null;
}

export function getVideoImage(videoId: string, signal?: AbortSignal) {
    return apiFetch<VideoImage>(
        `/library/videos/${videoId}/study-material/image`,
        { signal }
    );
}

function readImageAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Não foi possível ler a imagem selecionada.'));
            }
        };
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
        reader.readAsDataURL(file);
    });
}

/**
 * O backend atual recebe JSON { image: "data:image/...;base64,..." },
 * e não multipart/form-data. Mantemos a integração conforme esse contrato.
 */
export async function uploadVideoImage(videoId: string, file: File) {
    const image = await readImageAsDataUrl(file);

    return apiFetch<{ message: string; videoId: string; imageUrl: string; updatedAt: string }>(
        `/library/videos/${videoId}/study-material/image`,
        {
            method: 'POST',
            body: JSON.stringify({ image })
        }
    );
}

/**
 * Busca os bytes da imagem por nossa API autenticada (nao por URL publica do Drive).
 * O apiFetch padrao faz parse de JSON; para imagem usamos Response.blob().
 */
export async function getVideoImageBlob(videoId: string, signal?: AbortSignal): Promise<Blob> {
    const token = getAccessToken();
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(
        getApiUrl(`/library/videos/${encodeURIComponent(videoId)}/study-material/image/content`),
        { headers, signal, credentials: 'include' }
    );

    if (!response.ok) {
        let message = `Erro HTTP ${response.status} ao carregar imagem.`;
        try {
            const body: { error?: string; message?: string } = await response.json();
            message = body.error || body.message || message;
        } catch {
            // Algumas falhas (ex.: proxy) nao retornam JSON.
        }
        throw new Error(message);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.startsWith('image/')) {
        throw new Error('O servidor nao retornou um arquivo de imagem.');
    }

    return response.blob();
}
