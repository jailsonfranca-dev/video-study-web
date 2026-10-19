import { useEffect, useState } from 'react';
import { getVideoImage } from '../../api/studyMaterialApi';
import { StudyImageUpload } from './StudyImageUpload';

interface StudyFileTabProps {
    videoId: string;
}

/** Busca uma imagem específica do vídeo atual, independentemente do resumo por IA. */
export function StudyFileTab({ videoId }: StudyFileTabProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        getVideoImage(videoId, controller.signal)
            .then((image) => {
                if (!controller.signal.aborted) {
                    setImageUrl(image.imageUrl);
                }
            })
            .catch((err: unknown) => {
                if (!controller.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Não foi possível carregar o arquivo deste vídeo.'
                    );
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [videoId]);

    return (
        <div className="study-file-tab">
            <div className="study-file-header">
                <h3>Arquivo da aula</h3>
                <p>Adicione ou visualize a imagem de apoio associada a este vídeo.</p>
            </div>

            {loading ? (
                <p role="status">Carregando arquivo...</p>
            ) : error ? (
                <p className="study-error" role="alert">{error}</p>
            ) : (
                <StudyImageUpload
                    key={`${videoId}:${imageUrl ?? ''}`}
                    videoId={videoId}
                    imageUrl={imageUrl}
                    onImageUploaded={setImageUrl}
                />
            )}
        </div>
    );
}
