import {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';


interface StudyTranscriptProps {
    videoId: string;
    transcript: string | null;
}


interface HighlightRange {
    id: string;
    paragraphIndex: number;
    start: number;
    end: number;
    text: string;
}


/*
 * Quebra um bloco único de texto contínuo
 * (como o retornado pelo Whisper) em parágrafos
 * menores de ~3 frases para facilitar a leitura.
 */
function splitIntoReadableParagraphs(
    rawText: string
): string[] {

    const existingBlocks =
        rawText
            .split(/\n+/)
            .map(item => item.trim())
            .filter(Boolean);


    const result: string[] = [];

    const sentencesPerParagraph = 3;


    for (const block of existingBlocks) {

        /*
         * Se o bloco já for curto, mantém como está.
         */
        if (block.length <= 320) {
            result.push(block);
            continue;
        }


        /*
         * Divide ao final de cada pontuação (. ! ?)
         * seguida de espaço.
         */
        const sentences =
            block
                .split(/(?<=[.!?])\s+/)
                .map(s => s.trim())
                .filter(Boolean);


        if (sentences.length <= sentencesPerParagraph) {
            result.push(block);
            continue;
        }


        for (
            let i = 0;
            i < sentences.length;
            i += sentencesPerParagraph
        ) {

            const group =
                sentences
                    .slice(
                        i,
                        i + sentencesPerParagraph
                    )
                    .join(' ');


            if (group) {
                result.push(group);
            }

        }

    }


    return result;
}


export function StudyTranscript({
                                    videoId,
                                    transcript
                                }: StudyTranscriptProps) {

    const storageKey =
        `video-study:transcript-highlights:${videoId}`;


    const [
        copied,
        setCopied
    ] =
        useState(
            false
        );


    const [
        searchTerm,
        setSearchTerm
    ] =
        useState(
            ''
        );


    const [
        showOnlyHighlights,
        setShowOnlyHighlights
    ] =
        useState(
            false
        );


    const [
        highlights,
        setHighlights
    ] =
        useState<HighlightRange[]>(
            () => {

                try {

                    const saved =
                        localStorage.getItem(
                            storageKey
                        );

                    return saved
                        ? (JSON.parse(saved) as HighlightRange[])
                        : [];

                } catch {

                    return [];

                }

            }
        );


    const bodyRef =
        useRef<HTMLDivElement>(
            null
        );


    /*
     * Salva os grifos sempre que mudarem.
     */
    useEffect(
        () => {

            try {

                localStorage.setItem(
                    storageKey,
                    JSON.stringify(
                        highlights
                    )
                );

            } catch (error) {

                console.error(
                    'Erro ao salvar destaques da transcrição:',
                    error
                );

            }

        },
        [
            highlights,
            storageKey
        ]
    );


    const paragraphs =
        useMemo(
            () => {

                if (!transcript) {
                    return [];
                }

                return splitIntoReadableParagraphs(
                    transcript
                );

            },
            [
                transcript
            ]
        );


    async function handleCopy() {

        if (!transcript) {
            return;
        }


        try {

            await navigator
                .clipboard
                .writeText(
                    paragraphs.join('\n\n')
                );


            setCopied(
                true
            );


            setTimeout(
                () => {
                    setCopied(
                        false
                    );
                },
                2000
            );

        } catch (error) {

            console.error(
                'Não foi possível copiar a transcrição:',
                error
            );

        }

    }


    /*
     * Aplica o marca-texto na seleção atual do mouse
     */
    function handleHighlightSelection() {

        const selection =
            window.getSelection();


        if (
            !selection ||
            selection.rangeCount === 0 ||
            selection.isCollapsed
        ) {
            return;
        }


        const range =
            selection.getRangeAt(0);


        const container =
            bodyRef.current;


        if (
            !container ||
            !container.contains(
                range.commonAncestorContainer
            )
        ) {
            return;
        }


        const paragraphElements =
            Array.from(
                container.querySelectorAll<HTMLParagraphElement>(
                    'p[data-paragraph-index]'
                )
            );


        const newHighlights: HighlightRange[] = [];


        for (const pEl of paragraphElements) {

            if (!range.intersectsNode(pEl)) {
                continue;
            }


            const pIndex =
                Number(
                    pEl.dataset.paragraphIndex
                );


            const pText =
                paragraphs[pIndex] ?? '';


            if (!pText) {
                continue;
            }


            const pRange =
                document.createRange();

            pRange.selectNodeContents(pEl);


            const intersection =
                document.createRange();


            intersection.setStart(
                range.compareBoundaryPoints(
                    Range.START_TO_START,
                    pRange
                ) > 0
                    ? range.startContainer
                    : pRange.startContainer,
                range.compareBoundaryPoints(
                    Range.START_TO_START,
                    pRange
                ) > 0
                    ? range.startOffset
                    : pRange.startOffset
            );


            intersection.setEnd(
                range.compareBoundaryPoints(
                    Range.END_TO_END,
                    pRange
                ) < 0
                    ? range.endContainer
                    : pRange.endContainer,
                range.compareBoundaryPoints(
                    Range.END_TO_END,
                    pRange
                ) < 0
                    ? range.endOffset
                    : pRange.endOffset
            );


            const prefixRange =
                document.createRange();

            prefixRange.selectNodeContents(pEl);

            prefixRange.setEnd(
                intersection.startContainer,
                intersection.startOffset
            );


            const start =
                prefixRange.toString().length;

            const selectedStr =
                intersection.toString();

            const end =
                start + selectedStr.length;


            if (end > start && selectedStr.trim()) {

                newHighlights.push({
                    id: `${pIndex}-${start}-${end}-${Date.now()}`,
                    paragraphIndex: pIndex,
                    start,
                    end,
                    text: pText.slice(start, end)
                });

            }

        }


        if (newHighlights.length > 0) {

            setHighlights(
                current => {

                    const combined = [
                        ...current,
                        ...newHighlights
                    ];

                    /*
                     * Mescla intervalos sobrepostos no mesmo parágrafo
                     */
                    const byParagraph =
                        new Map<number, HighlightRange[]>();


                    for (const item of combined) {
                        const list =
                            byParagraph.get(item.paragraphIndex) ?? [];
                        list.push(item);
                        byParagraph.set(item.paragraphIndex, list);
                    }


                    const mergedResult: HighlightRange[] = [];


                    for (const [pIdx, list] of byParagraph.entries()) {

                        const sorted =
                            [...list].sort(
                                (a, b) => a.start - b.start
                            );

                        const merged: HighlightRange[] = [];

                        for (const item of sorted) {

                            const last =
                                merged[merged.length - 1];

                            if (last && item.start <= last.end) {

                                const newEnd =
                                    Math.max(last.end, item.end);

                                last.end = newEnd;
                                last.text =
                                    (paragraphs[pIdx] ?? '').slice(
                                        last.start,
                                        newEnd
                                    );

                            } else {

                                merged.push({ ...item });

                            }

                        }

                        mergedResult.push(...merged);

                    }


                    return mergedResult;

                }
            );


            selection.removeAllRanges();

        }

    }


    function handleRemoveHighlight(
        id: string
    ) {

        setHighlights(
            current =>
                current.filter(
                    item => item.id !== id
                )
        );

    }


    function handleClearAllHighlights() {

        setHighlights([]);
        setShowOnlyHighlights(false);

    }


    /*
     * Renderiza o texto de um parágrafo combinando:
     * 1. Marca-texto salvo pelo usuário (azul/amarelo clicável)
     * 2. Termo pesquisado na barra de busca
     */
    function renderParagraphContent(
        text: string,
        paragraphIndex: number,
        query: string
    ) {

        const pHighlights =
            highlights
                .filter(
                    h => h.paragraphIndex === paragraphIndex
                )
                .sort(
                    (a, b) => a.start - b.start
                );


        const segments: Array<{
            text: string;
            highlightId?: string;
        }> = [];


        let cursor = 0;


        for (const h of pHighlights) {

            const safeStart =
                Math.max(0, Math.min(h.start, text.length));

            const safeEnd =
                Math.max(safeStart, Math.min(h.end, text.length));


            if (safeStart > cursor) {
                segments.push({
                    text: text.slice(cursor, safeStart)
                });
            }


            if (safeEnd > safeStart) {
                segments.push({
                    text: text.slice(safeStart, safeEnd),
                    highlightId: h.id
                });
            }


            cursor = safeEnd;

        }


        if (cursor < text.length) {
            segments.push({
                text: text.slice(cursor)
            });
        }


        const trimmedQuery =
            query.trim();


        const searchRegex =
            trimmedQuery
                ? new RegExp(
                    `(${trimmedQuery.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        '\\$&'
                    )})`,
                    'gi'
                )
                : null;


        function renderWithSearch(
            segmentText: string,
            keyPrefix: string
        ) {

            if (!searchRegex || !trimmedQuery) {
                return segmentText;
            }


            const parts =
                segmentText.split(searchRegex);


            return parts.map(
                (part, idx) =>
                    part.toLowerCase() ===
                    trimmedQuery.toLowerCase()
                        ? (
                            <mark
                                key={`${keyPrefix}-s-${idx}`}
                                className="study-transcript-search-match"
                            >
                                {part}
                            </mark>
                        )
                        : part
            );

        }


        return segments.map(
            (segment, idx) => {

                if (segment.highlightId) {

                    return (
                        <mark
                            key={`hl-${segment.highlightId}-${idx}`}
                            className="study-transcript-user-highlight"
                            title="Clique para remover o marca-texto"
                            onClick={
                                () =>
                                    handleRemoveHighlight(
                                        segment.highlightId!
                                    )
                            }
                        >
                            {
                                renderWithSearch(
                                    segment.text,
                                    `hl-${idx}`
                                )
                            }
                        </mark>
                    );

                }


                return (
                    <span key={`txt-${idx}`}>
                        {
                            renderWithSearch(
                                segment.text,
                                `txt-${idx}`
                            )
                        }
                    </span>
                );

            }
        );

    }


    if (
        !transcript ||
        paragraphs.length === 0
    ) {

        return (
            <div className="study-empty">
                <strong>
                    Transcrição indisponível
                </strong>

                <p>
                    Este vídeo ainda não possui transcrição salva.
                </p>
            </div>
        );

    }


    return (
        <div className="study-transcript">

            <div className="study-transcript-toolbar">

                <input
                    type="search"
                    placeholder="Buscar palavra ou trecho na transcrição..."
                    value={searchTerm}
                    onChange={
                        event =>
                            setSearchTerm(
                                event.target.value
                            )
                    }
                    className="study-transcript-search"
                    aria-label="Buscar na transcrição"
                />


                <div className="study-transcript-actions">

                    <button
                        type="button"
                        onMouseDown={
                            /*
                             * Evita perder a seleção do texto
                             * ao clicar no botão de destacar.
                             */
                            event =>
                                event.preventDefault()
                        }
                        onClick={handleHighlightSelection}
                        className="study-transcript-highlight-btn"
                        title="Selecione um trecho do texto abaixo e clique aqui para grifar"
                    >
                        🖍️ Destacar seleção
                    </button>


                    {highlights.length > 0 && (

                        <>

                            <button
                                type="button"
                                onClick={
                                    () =>
                                        setShowOnlyHighlights(
                                            prev => !prev
                                        )
                                }
                                className={
                                    `study-transcript-filter-btn ${
                                        showOnlyHighlights
                                            ? 'active'
                                            : ''
                                    }`
                                }
                            >
                                {
                                    showOnlyHighlights
                                        ? 'Ver texto completo'
                                        : `Meus destaques (${highlights.length})`
                                }
                            </button>


                            <button
                                type="button"
                                onClick={handleClearAllHighlights}
                                className="study-transcript-clear-btn"
                                title="Limpar todas as marcações deste vídeo"
                            >
                                Limpar
                            </button>

                        </>

                    )}


                    <button
                        type="button"
                        onClick={handleCopy}
                        className="study-transcript-copy-btn"
                    >
                        {
                            copied
                                ? '✓ Copiado!'
                                : 'Copiar transcrição'
                        }
                    </button>

                </div>

            </div>


            <p className="study-transcript-hint">
                💡 <strong>Dica:</strong> Selecione qualquer trecho importante com o mouse e clique em <strong>"🖍️ Destacar seleção"</strong> para deixar marcado para revisão (clique sobre um trecho marcado para removê-lo).
            </p>


            {showOnlyHighlights ? (

                <div className="study-transcript-highlights-list">

                    {highlights.map(
                        item => (

                            <div
                                key={item.id}
                                className="study-transcript-highlight-card"
                            >

                                <span>
                                    "{item.text}"
                                </span>


                                <button
                                    type="button"
                                    onClick={
                                        () =>
                                            handleRemoveHighlight(
                                                item.id
                                            )
                                    }
                                    title="Remover destaque"
                                >
                                    ✕
                                </button>

                            </div>

                        )
                    )}

                </div>

            ) : (

                <div
                    ref={bodyRef}
                    className="study-transcript-body"
                >

                    {paragraphs.map(
                        (paragraph, index) => (

                            <p
                                key={index}
                                data-paragraph-index={index}
                                className="study-transcript-paragraph"
                            >
                                {
                                    renderParagraphContent(
                                        paragraph,
                                        index,
                                        searchTerm
                                    )
                                }
                            </p>

                        )
                    )}

                </div>

            )}

        </div>
    );
}