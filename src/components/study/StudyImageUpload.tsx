import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { getVideoImagePageBlob } from '../../api/studyMaterialApi';
import type { VideoImagePage } from '../../api/studyMaterialApi';

interface Props {
    videoId: string;
    page: VideoImagePage;
    index: number;
    total: number;
    busy: boolean;
    onSelect: (index: number) => void;
    onAdd: () => void;
    onDelete: () => void;
}

/** Visualizador com navegação de páginas, zoom, pan e Fullscreen API. */
export function StudyImageUpload({ videoId, page, index, total, busy, onSelect, onAdd, onDelete }: Props) {
    const [zoom, setZoom] = useState(1);
    const [preview, setPreview] = useState<{ pageId: string; url: string } | null>(null);
    const [failedPageId, setFailedPageId] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [dragging, setDragging] = useState(false);
    const viewerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const panRef = useRef<{
        pointerId: number;
        x: number;
        y: number;
        left: number;
        top: number;
    } | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let objectUrl: string | null = null;
        getVideoImagePageBlob(videoId, page.id, controller.signal)
            .then(blob => {
                if (controller.signal.aborted) return;
                objectUrl = URL.createObjectURL(blob);
                setPreview({ pageId: page.id, url: objectUrl });
                setFailedPageId(null);
            })
            .catch(err => {
                if (!controller.signal.aborted) {
                    console.error('Erro ao carregar página:', err);
                    setFailedPageId(page.id);
                }
            });
        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [videoId, page.id]);

    useEffect(() => {
        const handleChange = () => setFullscreen(document.fullscreenElement === viewerRef.current);
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const goto = (newIndex: number) => {
        if (newIndex < 0 || newIndex >= total) return;
        setZoom(1);
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
            scrollRef.current.scrollTop = 0;
        }
        onSelect(newIndex);
    };

    const toggleFullscreen = async () => {
        try {
            if (document.fullscreenElement === viewerRef.current) {
                await document.exitFullscreen();
            } else {
                await viewerRef.current?.requestFullscreen();
                viewerRef.current?.focus();
            }
        } catch (error) {
            console.error('Não foi possível alternar tela cheia:', error);
        }
    };

    const onViewerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft') { event.preventDefault(); goto(index - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); goto(index + 1); }
    };

    const handlePanStart = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || preview?.pageId !== page.id) return;
        const element = event.currentTarget;
        if (element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight) return;
        event.preventDefault();
        panRef.current = {
            pointerId: event.pointerId,
            x: event.clientX, y: event.clientY,
            left: element.scrollLeft, top: element.scrollTop
        };
        element.setPointerCapture(event.pointerId);
        setDragging(true);
    };

    const handlePanMove = (event: PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;
        if (!pan || pan.pointerId !== event.pointerId) return;
        event.currentTarget.scrollLeft = pan.left - (event.clientX - pan.x);
        event.currentTarget.scrollTop = pan.top - (event.clientY - pan.y);
    };

    const handlePanEnd = (event: PointerEvent<HTMLDivElement>) => {
        if (panRef.current?.pointerId !== event.pointerId) return;
        panRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setDragging(false);
    };

    const currentUrl = preview?.pageId === page.id ? preview.url : null;
    const failed = failedPageId === page.id;

    return (
        <div className="study-image-container">
            <div className="study-image-viewer-wrapper" ref={viewerRef} tabIndex={-1} onKeyDown={onViewerKeyDown}>
                <div className="study-image-toolbar">
                    <div className="zoom-controls" aria-label="Zoom da imagem">
                        <button type="button" onClick={() => setZoom(z => Math.max(.5, z - .25))} aria-label="Diminuir zoom">−</button>
                        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                        <button type="button" onClick={() => setZoom(z => Math.min(3, z + .25))} aria-label="Aumentar zoom">+</button>
                        <button type="button" onClick={() => setZoom(1)} className="zoom-reset-btn" title="Restaurar zoom">1:1</button>
                    </div>

                    <nav className="study-page-controls" aria-label="Páginas do arquivo">
                        <button type="button" disabled={index === 0} onClick={() => goto(index - 1)} aria-label="Página anterior">‹</button>
                        <span className="study-page-counter" aria-live="polite">Parte {index + 1} de {total}</span>
                        <button type="button" disabled={index === total - 1} onClick={() => goto(index + 1)} aria-label="Próxima página">›</button>
                    </nav>

                    <div className="study-image-actions">
                        <button type="button" className="study-image-replace-btn" onClick={toggleFullscreen}
                                aria-label={fullscreen ? 'Sair da tela cheia' : 'Ver em tela cheia'}>
                            {fullscreen ? '⤢ Sair da tela cheia' : '⛶ Tela cheia'}
                        </button>
                        <button type="button" className="study-image-replace-btn" onClick={onAdd} disabled={busy || total >= 30}>
                            {busy ? 'Enviando...' : '+ Adicionar páginas'}
                        </button>
                        <button type="button" className="study-image-replace-btn study-image-delete-btn" onClick={onDelete} disabled={busy}>
                            Excluir página
                        </button>
                    </div>
                </div>

                <div className="study-image-viewport">
                    <div className={`study-image-scrollable${dragging ? ' is-dragging' : ''}`}
                         ref={scrollRef} tabIndex={0}
                         aria-label={`Página ${index + 1} de ${total}: arraste ou role para navegar na imagem`}
                         onPointerDown={handlePanStart} onPointerMove={handlePanMove}
                         onPointerUp={handlePanEnd} onPointerCancel={handlePanEnd}
                         onLostPointerCapture={() => { panRef.current = null; setDragging(false); }}>
                        {failed ? (
                            <div className="study-image-preview-fallback" role="alert">
                                <p>Não foi possível carregar esta página.</p>
                                <a href={page.imageUrl} target="_blank" rel="noopener noreferrer">Abrir no Google Drive</a>
                            </div>
                        ) : !currentUrl ? (
                            <p role="status" className="study-image-loading">Carregando página {index + 1}...</p>
                        ) : (
                            <img src={currentUrl}
                                 alt={`Infográfico da aula, parte ${index + 1} de ${total}`}
                                 className="study-zoomable-image"
                                 style={{ width: `${zoom * 100}%` }}
                                 draggable={false}
                                 onError={() => setFailedPageId(page.id)} />
                        )}
                    </div>
                </div>
                <div className="study-page-indicators" aria-label="Ir para uma página">
                    {Array.from({ length: total }, (_, number) => (
                        <button type="button" key={number}
                                onClick={() => goto(number)}
                                className={number === index ? 'is-active' : ''}
                                aria-current={number === index ? 'page' : undefined}
                                aria-label={`Mostrar página ${number + 1}`}>
                            {number + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
