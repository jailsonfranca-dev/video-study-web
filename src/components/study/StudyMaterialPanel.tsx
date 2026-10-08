import {
    useEffect,
    useRef,
    useState
} from 'react';

import loadingGif from '../../assets/Workspace_hero.gif';

import {
    generateStudyMaterial,
    getStudyMaterial,
    regenerateSummary,
    regenerateMindMap,
    regenerateFlashcards
} from '../../api/studyMaterialApi';

import type {
    StudyMaterial
} from '../../types/studyMaterial';

import {
    StudySummary
} from './StudySummary';

import {
    StudyMindMap
} from './StudyMindMap';

import {
    StudyFlashcards
} from './StudyFlashcards';

import './StudyMaterialPanel.css';


type Tab =
    | 'summary'
    | 'mindMap'
    | 'flashcards';


type GenerationFeedback =
    | {
    type:
        'success' | 'error';

    message:
        string;
}
    | null;


interface StudyMaterialPanelProps {

    videoId:
        string;

}


export function StudyMaterialPanel({
                                       videoId
                                   }: StudyMaterialPanelProps) {

    return (
        <StudyMaterialPanelContent
            key={videoId}
            videoId={videoId}
        />
    );

}


function StudyMaterialPanelContent({
                                       videoId
                                   }: StudyMaterialPanelProps) {

    /*
     * =========================================
     * VIDEO ATUAL
     * =========================================
     *
     * A geração de material pode demorar.
     *
     * Se o usuário trocar de aula durante
     * uma geração, usamos esse ref para
     * impedir que a resposta da aula anterior
     * seja exibida na nova aula.
     */

    const currentVideoIdRef =
        useRef(
            videoId
        );


    /*
     * =========================================
     * MATERIAL
     * =========================================
     */

    const [
        material,
        setMaterial
    ] =
        useState<StudyMaterial | null>(
            null
        );


    /*
     * =========================================
     * ABA ATIVA
     * =========================================
     */

    const [
        activeTab,
        setActiveTab
    ] =
        useState<Tab>(
            'summary'
        );


    /*
     * =========================================
     * CARREGAMENTO INICIAL
     * =========================================
     */

    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );


    /*
     * =========================================
     * GERAÇÃO COMPLETA
     * =========================================
     */

    const [
        generating,
        setGenerating
    ] =
        useState(
            false
        );


    /*
     * =========================================
     * FEEDBACK DA GERAÇÃO
     * =========================================
     */

    const [
        generationFeedback,
        setGenerationFeedback
    ] =
        useState<GenerationFeedback>(
            null
        );


    /*
     * =========================================
     * REGERAÇÃO
     * =========================================
     */

    const [
        regenerating,
        setRegenerating
    ] =
        useState<Tab | null>(
            null
        );


    /*
     * =========================================
     * ERRO GERAL
     * =========================================
     */

    const [
        error,
        setError
    ] =
        useState<string | null>(
            null
        );


    /*
     * =========================================
     * CARREGAR MATERIAL
     * =========================================
     */

    useEffect(
        () => {

            /*
             * =========================================
             * VÍDEO ATUAL
             * =========================================
             *
             * É importante restaurar o ref aqui.
             *
             * No React StrictMode, em desenvolvimento,
             * o efeito pode executar:
             *
             * setup
             * ↓
             * cleanup
             * ↓
             * setup novamente
             *
             * Portanto o ref precisa receber novamente
             * o videoId sempre que o efeito iniciar.
             */

            currentVideoIdRef.current =
                videoId;


            const controller =
                new AbortController();


            async function load() {

                try {

                    const result =
                        await getStudyMaterial(
                            videoId,
                            controller.signal
                        );


                    if (
                        controller
                            .signal
                            .aborted
                    ) {

                        return;

                    }


                    setMaterial(
                        result
                    );


                } catch (
                    error
                    ) {

                    /*
                     * Abort é esperado quando
                     * mudamos de vídeo.
                     */

                    if (
                        error instanceof DOMException &&
                        error.name ===
                        'AbortError'
                    ) {

                        return;

                    }


                    if (
                        controller
                            .signal
                            .aborted
                    ) {

                        return;

                    }


                    setError(

                        error instanceof Error

                            ? error.message

                            : 'Não foi possível carregar o material.'

                    );


                } finally {

                    if (
                        !controller
                            .signal
                            .aborted
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            }


            void load();


            return () => {

                /*
                 * Marca esta instância como antiga.
                 */
                currentVideoIdRef.current =
                    '';


                controller.abort();

            };

        },
        [
            videoId
        ]
    );


    /*
     * =========================================
     * GERAR MATERIAL COMPLETO
     * =========================================
     */

    async function handleGenerate() {

        /*
         * =========================================
         * EVITAR GERAÇÕES DUPLICADAS
         * =========================================
         */

        if (
            generating
        ) {

            return;

        }


        const requestedVideoId =
            videoId;


        try {

            /*
             * =====================================
             * INICIAR GERAÇÃO
             * =====================================
             */

            setGenerating(
                true
            );


            setError(
                null
            );


            setGenerationFeedback(
                null
            );


            /*
             * =====================================
             * GERAR MATERIAL NO BACKEND
             * =====================================
             *
             * A resposta de generateStudyMaterial()
             * NÃO é do tipo StudyMaterial.
             *
             * Portanto, não usamos o retorno dela
             * diretamente em setMaterial().
             */

            await generateStudyMaterial(
                requestedVideoId
            );


            /*
             * =====================================
             * RECARREGAR MATERIAL COMPLETO
             * =====================================
             *
             * getStudyMaterial() retorna exatamente
             * o tipo StudyMaterial esperado pelo
             * estado do componente.
             */

            const refreshedMaterial =
                await getStudyMaterial(
                    requestedVideoId
                );


            /*
             * O usuário pode ter trocado de aula
             * durante o processamento.
             */

            if (
                currentVideoIdRef.current !==
                requestedVideoId
            ) {

                return;

            }


            setMaterial(
                refreshedMaterial
            );


            setGenerationFeedback({

                type:
                    'success',

                message:
                    'Material de estudo gerado com sucesso.'

            });


        } catch (
            error
            ) {

            /*
             * Não exibir erro de uma aula
             * anterior caso o componente
             * já tenha sido desmontado.
             */

            if (
                currentVideoIdRef.current !==
                requestedVideoId
            ) {

                return;

            }


            setGenerationFeedback({

                type:
                    'error',

                message:

                    error instanceof Error

                        ? error.message

                        : 'Não foi possível gerar o material de estudo.'

            });


        } finally {

            if (
                currentVideoIdRef.current ===
                requestedVideoId
            ) {

                setGenerating(
                    false
                );

            }

        }

    }


    /*
     * =========================================
     * REGENERAR MATERIAL DA ABA ATUAL
     * =========================================
     */

    async function handleRegenerate() {

        if (
            !material
        ) {

            return;

        }


        /*
         * Evita regeração duplicada.
         */

        if (
            regenerating !== null
        ) {

            return;

        }


        const requestedVideoId =
            videoId;


        const requestedTab =
            activeTab;


        try {

            setRegenerating(
                requestedTab
            );


            setError(
                null
            );


            /*
             * Feedback da geração completa
             * não precisa permanecer depois
             * que uma nova regeneração começa.
             */

            setGenerationFeedback(
                null
            );


            /*
             * =================================
             * RESUMO
             * =================================
             */

            if (
                requestedTab ===
                'summary'
            ) {

                const response =
                    await regenerateSummary(
                        requestedVideoId
                    );


                if (
                    currentVideoIdRef.current !==
                    requestedVideoId
                ) {

                    return;

                }


                setMaterial(
                    current =>

                        current

                            ? {

                                ...current,

                                summary:
                                response
                                    .data
                                    .summary,

                                status:
                                response
                                    .data
                                    .status,

                                generationModel:
                                response
                                    .data
                                    .generationModel,

                                generatedAt:
                                response
                                    .data
                                    .generatedAt,

                                updatedAt:
                                response
                                    .data
                                    .updatedAt

                            }

                            : current
                );

            }


            /*
             * =================================
             * MAPA MENTAL
             * =================================
             */

            if (
                requestedTab ===
                'mindMap'
            ) {

                const response =
                    await regenerateMindMap(
                        requestedVideoId
                    );


                if (
                    currentVideoIdRef.current !==
                    requestedVideoId
                ) {

                    return;

                }


                setMaterial(
                    current =>

                        current

                            ? {

                                ...current,

                                mindMap:
                                response
                                    .data
                                    .mindMap,

                                status:
                                response
                                    .data
                                    .status,

                                generationModel:
                                response
                                    .data
                                    .generationModel,

                                generatedAt:
                                response
                                    .data
                                    .generatedAt,

                                updatedAt:
                                response
                                    .data
                                    .updatedAt

                            }

                            : current
                );

            }


            /*
             * =================================
             * FLASHCARDS
             * =================================
             */

            if (
                requestedTab ===
                'flashcards'
            ) {

                const response =
                    await regenerateFlashcards(
                        requestedVideoId
                    );


                if (
                    currentVideoIdRef.current !==
                    requestedVideoId
                ) {

                    return;

                }


                setMaterial(
                    current =>

                        current

                            ? {

                                ...current,

                                flashcards:
                                response
                                    .data
                                    .flashcards,

                                status:
                                response
                                    .data
                                    .status,

                                generationModel:
                                response
                                    .data
                                    .generationModel,

                                generatedAt:
                                response
                                    .data
                                    .generatedAt

                            }

                            : current
                );

            }


        } catch (
            error
            ) {

            if (
                currentVideoIdRef.current !==
                requestedVideoId
            ) {

                return;

            }


            setError(

                error instanceof Error

                    ? error.message

                    : 'Erro ao regenerar material.'

            );


        } finally {

            if (
                currentVideoIdRef.current ===
                requestedVideoId
            ) {

                setRegenerating(
                    null
                );

            }

        }

    }


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (
        loading
    ) {

        return (

            <section className="study-material study-material-panel">

                <p
                    role="status"
                    aria-live="polite"
                >
                    Carregando material de estudo...
                </p>

            </section>

        );

    }


    /*
     * =========================================
     * MATERIAL AINDA NÃO GERADO
     * =========================================
     */

    if (
        !material ||
        !material.generated
    ) {

        return (

            <section className="study-material study-material-panel">

                <h2>
                    Material de estudo
                </h2>


                <p>
                    Este vídeo ainda não possui
                    material gerado por IA.
                </p>


                {
                    error && (

                        <p
                            className="study-error"
                            role="alert"
                        >
                            {error}
                        </p>

                    )
                }


                <button

                    type="button"

                    onClick={
                        handleGenerate
                    }

                    disabled={
                        generating
                    }

                    aria-busy={
                        generating
                    }

                >

                    <span
                        className="async-button-content"
                    >

                        {
                            generating && (

                                <div></div>

                            )
                        }


                        <span>

                            {
                                generating

                                    ? <img
                                        src={loadingGif}
                                        alt=""
                                        className="ai-loading-gif"
                                        aria-hidden="true"
                                    />

                                    : '✨ Gerar material com IA'
                            }

                        </span>

                    </span>

                </button>


                {/*
                 * =====================================
                 * PROCESSANDO
                 * =====================================
                 */}

                {
                    generating && (

                        <div

                            className="ai-generation-status"

                            role="status"

                            aria-live="polite"

                        >

                            <span

                                className="ai-generation-status-icon"

                                aria-hidden="true"

                            >
                                ✨
                            </span>


                            <div>

                                <strong>
                                    Preparando seu material de estudo
                                </strong>


                                <p>
                                    A IA está processando o conteúdo.
                                    Isso pode levar um pouco de tempo.
                                </p>

                            </div>

                        </div>

                    )
                }


                {/*
                 * =====================================
                 * ERRO DA GERAÇÃO
                 * =====================================
                 */}

                {
                    !generating &&
                    generationFeedback && (

                        <div

                            className={
                                `ai-generation-feedback ai-generation-feedback-${generationFeedback.type}`
                            }

                            role={
                                generationFeedback.type ===
                                'error'

                                    ? 'alert'

                                    : 'status'
                            }

                            aria-live="polite"

                        >

                            <span
                                aria-hidden="true"
                            >

                                {
                                    generationFeedback.type ===
                                    'success'

                                        ? '✓'

                                        : '⚠'
                                }

                            </span>


                            <span>
                                {
                                    generationFeedback.message
                                }
                            </span>

                        </div>

                    )
                }

            </section>

        );

    }


    /*
     * =========================================
     * MATERIAL GERADO
     * =========================================
     */

    return (

        <section className="study-material study-material-panel">

            {/*
             * =====================================
             * ABAS
             * =====================================
             */}

            <div
                className="study-tabs"
            >

                <button

                    type="button"

                    className={
                        activeTab ===
                        'summary'

                            ? 'active'

                            : ''
                    }

                    onClick={
                        () =>
                            setActiveTab(
                                'summary'
                            )
                    }

                >
                    Resumo
                </button>


                <button

                    type="button"

                    className={
                        activeTab ===
                        'mindMap'

                            ? 'active'

                            : ''
                    }

                    onClick={
                        () =>
                            setActiveTab(
                                'mindMap'
                            )
                    }

                >
                    Mapa Mental
                </button>


                <button

                    type="button"

                    className={
                        activeTab ===
                        'flashcards'

                            ? 'active'

                            : ''
                    }

                    onClick={
                        () =>
                            setActiveTab(
                                'flashcards'
                            )
                    }

                >
                    Flashcards
                </button>

            </div>


            {/*
             * =====================================
             * AÇÕES
             * =====================================
             */}

            <div
                className="study-actions"
            >

                <span>
                    Status:
                    {' '}
                    {material.status}
                </span>


                <button

                    type="button"

                    onClick={
                        handleRegenerate
                    }

                    disabled={
                        regenerating !== null
                    }

                    aria-busy={
                        regenerating ===
                        activeTab
                    }

                >

                    <span
                        className="async-button-content"
                    >

                        {
                            regenerating ===
                            activeTab && (

                                <span
                                    className="button-spinner"
                                    aria-hidden="true"
                                />

                            )
                        }


                        <span>

                            {
                                regenerating ===
                                activeTab

                                    ? 'Regenerando...'

                                    : 'Regenerar'
                            }

                        </span>

                    </span>

                </button>

            </div>


            {/*
             * =====================================
             * SUCESSO / ERRO DA GERAÇÃO COMPLETA
             * =====================================
             */}

            {
                !generating &&
                generationFeedback && (

                    <div

                        className={
                            `ai-generation-feedback ai-generation-feedback-${generationFeedback.type}`
                        }

                        role={
                            generationFeedback.type ===
                            'error'

                                ? 'alert'

                                : 'status'
                        }

                        aria-live="polite"

                    >

                        <span
                            aria-hidden="true"
                        >

                            {
                                generationFeedback.type ===
                                'success'

                                    ? '✓'

                                    : '⚠'
                            }

                        </span>


                        <span>
                            {
                                generationFeedback.message
                            }
                        </span>

                    </div>

                )
            }


            {/*
             * =====================================
             * ERRO DA REGERAÇÃO
             * =====================================
             */}

            {
                error && (

                    <p
                        className="study-error"
                        role="alert"
                    >
                        {error}
                    </p>

                )
            }


            {/*
             * =====================================
             * CONTEÚDO
             * =====================================
             */}

            <div
                className="study-content"
            >

                {/*
                 * =================================
                 * RESUMO
                 * =================================
                 */}

                {
                    activeTab ===
                    'summary' &&
                    material.summary && (

                        <StudySummary

                            summary={
                                material.summary
                            }

                        />

                    )
                }


                {/*
                 * =================================
                 * MAPA MENTAL
                 * =================================
                 */}

                {
                    activeTab ===
                    'mindMap' &&
                    material.mindMap && (

                        <StudyMindMap

                            mindMap={
                                material.mindMap
                            }

                        />

                    )
                }


                {/*
                 * =================================
                 * FLASHCARDS
                 * =================================
                 */}

                {
                    activeTab ===
                    'flashcards' && (

                        <StudyFlashcards

                            flashcards={
                                material.flashcards
                            }

                        />

                    )
                }

            </div>

        </section>

    );

}