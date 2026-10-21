import { useEffect, useRef, useState } from 'react';
import {
    deleteVideoImagePage,
    getVideoImagePages,
    uploadVideoImagePage
} from '../../api/studyMaterialApi';
import type { VideoImagePage } from '../../api/studyMaterialApi';
import { StudyImageUpload } from './StudyImageUpload';

interface StudyFileTabProps { videoId: string }

// A chave impede que dados/páginas de um vídeo apareçam ao trocar de aula.
export function StudyFileTab({ videoId }: StudyFileTabProps) {
    return <StudyFileTabContent key={videoId} videoId={videoId} />;
}

function StudyFileTabContent({ videoId }: StudyFileTabProps) {
    const [pages, setPages] = useState<VideoImagePage[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const controller = new AbortController();
        getVideoImagePages(videoId, controller.signal)
            .then(data => {
                if (!controller.signal.aborted) setPages(data.pages);
            })
            .catch((err: unknown) => {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Erro ao carregar páginas.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [videoId]);

    const refresh = async (selectLast = false) => {
        const data = await getVideoImagePages(videoId);
        setPages(data.pages);
        setIndex(old => selectLast ? Math.max(0, data.pages.length - 1)
            : Math.min(old, Math.max(0, data.pages.length - 1)));
    };

    const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';
        if (!files.length) return;

        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        const invalid = files.find(f => !allowed.includes(f.type) || f.size > 5 * 1024 * 1024 || f.size === 0);
        if (invalid) {
            setError('Selecione somente JPG, PNG ou WebP com até 5 MB cada.');
            return;
        }
        if (pages.length + files.length > 30) {
            setError('Limite de 30 páginas por aula.');
            return;
        }

        setBusy(true);
        setError(null);
        let uploaded = 0;
        try {
            // Sequencial, para preservar a ordem escolhida no seletor.
            for (const file of files) {
                await uploadVideoImagePage(videoId, file);
                uploaded++;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro de upload.';
            setError(`${uploaded} de ${files.length} imagem(ns) enviada(s). ${message}`);
        } finally {
            try { await refresh(true); }
            catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível atualizar a galeria.'); }
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        const current = pages[index];
        if (!current || busy) return;
        if (!window.confirm(`Excluir a página ${index + 1} desta aula? Essa operação remove o arquivo do Google Drive.`)) return;
        setBusy(true);
        setError(null);
        try {
            await deleteVideoImagePage(videoId, current.id);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Não foi possível excluir a página.');
        } finally {
            setBusy(false);
        }
    };

    const current = pages[index];

    return (
        <div className="study-file-tab">
            <div className="study-file-header">
                <h3>Arquivo da aula</h3>
                <p>Adicione páginas de resumo visual e navegue entre elas. Até 30 imagens por aula.</p>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                aria-label="Selecionar imagens da aula"
                onChange={handleFiles}
            />
            {error && <p className="study-error" role="alert">{error}</p>}
            {loading ? <p role="status">Carregando páginas...</p> : (
                pages.length === 0 ? (
                    <div className="study-image-dropzone">
                        <span aria-hidden="true" className="empty-icon">🖼️</span>
                        <h3>Nenhuma imagem nesta aula</h3>
                        <p>Envie a Parte 1, Parte 2 e demais páginas. JPG, PNG ou WebP (5 MB cada).</p>
                        <button type="button" className="primary-button" disabled={busy}
                                onClick={() => fileInputRef.current?.click()}>
                            {busy ? 'Enviando...' : 'Selecionar imagens'}
                        </button>
                    </div>
                ) : (
                    <StudyImageUpload
                        videoId={videoId}
                        page={current}
                        index={index}
                        total={pages.length}
                        busy={busy}
                        onSelect={setIndex}
                        onAdd={() => fileInputRef.current?.click()}
                        onDelete={handleDelete}
                    />
                )
            )}
        </div>
    );
}
