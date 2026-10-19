import {
    useState,
    useRef,
    useEffect
} from 'react';
import { getVideoImageBlob, uploadVideoImage } from '../../api/studyMaterialApi';


interface StudyImageUploadProps {
    videoId: string;
    imageUrl?: string | null;
    onImageUploaded: (newUrl: string) => void;
}


export function StudyImageUpload({
                                     videoId,
                                     imageUrl,
                                     onImageUploaded
                                 }: StudyImageUploadProps) {

    const [uploading, setUploading] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [previewFailed, setPreviewFailed] = useState(false);
    // Ao montar um novo componente (key do StudyFileTab), inicia em loading se houver imagem.
    const [previewLoading, setPreviewLoading] = useState(Boolean(imageUrl));
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const panRef = useRef<{
        pointerId: number;
        startX: number;
        startY: number;
        scrollLeft: number;
        scrollTop: number;
    } | null>(null);

    // Imagens do Drive nao sao enderecos estaveis para <img src>.
    // Nossa API entrega bytes com JWT; um blob URL local permite exibi-los.
    useEffect(() => {
        const controller = new AbortController();
        let objectUrl: string | null = null;

        // Nada de setState sincrono aqui. O estado inicial ja reflete imageUrl.
        if (!imageUrl) return () => controller.abort();

        getVideoImageBlob(videoId, controller.signal)
            .then(blob => {
                if (controller.signal.aborted) return;
                objectUrl = URL.createObjectURL(blob);
                setPreviewUrl(objectUrl);
            })
            .catch(err => {
                if (!controller.signal.aborted) {
                    console.error('Falha ao carregar imagem da aula:', err);
                    setPreviewFailed(true);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setPreviewLoading(false);
            });

        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [videoId, imageUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
            e.target.value = '';
            return;
        }

        // JSON/base64 cresce ~33%; limite seguro para express.json({ limit: '10mb' }).
        if (file.size > 5 * 1024 * 1024) {
            setError('A imagem deve ter no máximo 5 MB.');
            e.target.value = '';
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const response = await uploadVideoImage(videoId, file);
            onImageUploaded(response.imageUrl);
            setZoom(1);
            setPreviewFailed(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao enviar a imagem.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // Pan (arrastar) com mouse: o elemento de rolagem acompanha o ponteiro.
    const handlePanStart = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || !previewUrl || previewFailed) return;
        const element = event.currentTarget;
        if (element.scrollWidth <= element.clientWidth && element.scrollHeight <= element.clientHeight) return;

        event.preventDefault();
        panRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            scrollLeft: element.scrollLeft,
            scrollTop: element.scrollTop
        };
        element.setPointerCapture(event.pointerId);
        setDragging(true);
    };

    const handlePanMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;
        if (!pan || pan.pointerId !== event.pointerId) return;
        event.currentTarget.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
        event.currentTarget.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
    };

    const handlePanEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        if (panRef.current?.pointerId !== event.pointerId) return;
        panRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setDragging(false);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleResetZoom = () => setZoom(1);

    return (
        <div className="study-image-container">
            {error && <p className="study-error" role="alert">{error}</p>}
            {!imageUrl ? (
                <div className="study-image-dropzone">
                    <div className="empty-icon">🖼️</div>
                    <h3>Nenhum infográfico ou resumo visual cadastrado</h3>
                    <p>Faça o upload da imagem resumo desta aula (ex: mapa mental desenhado, slide ou infográfico como o da Figura 2).</p>
                    <button type="button" className="primary-button" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                        {uploading ? 'Enviando imagem...' : 'Selecionar Imagem'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <div className="study-image-viewer-wrapper">
                    <div className="study-image-toolbar">
                        <div className="zoom-controls">
                            <button type="button" onClick={handleZoomOut} title="Diminuir Zoom (-)">-</button>
                            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                            <button type="button" onClick={handleZoomIn} title="Aumentar Zoom (+)">+</button>
                            <button type="button" onClick={handleResetZoom} className="zoom-reset-btn" title="Resetar Zoom">1:1</button>
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="study-image-replace-btn"
                            disabled={uploading}
                        >
                            {uploading ? 'Enviando...' : '🔄 Substituir Imagem'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="study-image-viewport">
                        <div
                            className={`study-image-scrollable${dragging ? ' is-dragging' : ''}`}
                            tabIndex={0}
                            aria-label="Imagem da aula: role ou arraste para ver as partes ampliadas"
                            onPointerDown={handlePanStart}
                            onPointerMove={handlePanMove}
                            onPointerUp={handlePanEnd}
                            onPointerCancel={handlePanEnd}
                            onLostPointerCapture={() => {
                                panRef.current = null;
                                setDragging(false);
                            }}
                        >
                            {previewLoading ? (
                                <p role="status">Carregando imagem...</p>
                            ) : previewFailed || !previewUrl ? (
                                <div className="study-image-preview-fallback" role="status">
                                    <p>Não foi possível exibir a prévia desta imagem.</p>
                                    <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                                        Abrir arquivo no Google Drive
                                    </a>
                                </div>
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Imagem associada a este vídeo"
                                    onError={() => setPreviewFailed(true)}
                                    // Largura real altera scrollWidth/scrollHeight, ao contrario de transform: scale().
                                    style={{ width: `${zoom * 100}%` }}
                                    draggable={false}
                                    className="study-zoomable-image"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}