import { apiFetch } from './http';

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