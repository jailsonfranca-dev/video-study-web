import {
    useEffect,
    useState
} from 'react';

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


interface StudyMaterialPanelProps {
    videoId: string;
}


export function StudyMaterialPanel({
                                       videoId
                                   }: StudyMaterialPanelProps) {

    const [
        material,
        setMaterial
    ] =
        useState<StudyMaterial | null>(
            null
        );


    const [
        activeTab,
        setActiveTab
    ] =
        useState<Tab>(
            'summary'
        );


    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );


    const [
        generating,
        setGenerating
    ] =
        useState(
            false
        );


    const [
        regenerating,
        setRegenerating
    ] =
        useState<Tab | null>(
            null
        );


    const [
        error,
        setError
    ] =
        useState<string | null>(
            null
        );


    useEffect(
        () => {

            const controller =
                new AbortController();


            async function load() {

                try {

                    setLoading(
                        true
                    );

                    setError(
                        null
                    );


                    const result =
                        await getStudyMaterial(
                            videoId,
                            controller.signal
                        );


                    setMaterial(
                        result
                    );


                } catch (error) {

                    if (
                        error instanceof DOMException &&
                        error.name ===
                        'AbortError'
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
                        !controller.signal.aborted
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            }


            load();


            return () =>
                controller.abort();

        },
        [
            videoId
        ]
    );


    async function handleGenerate() {

        try {

            setGenerating(
                true
            );

            setError(
                null
            );


            const response =
                await generateStudyMaterial(
                    videoId
                );


            setMaterial(
                response.material
            );


        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : 'Erro ao gerar material.'
            );


        } finally {

            setGenerating(
                false
            );

        }

    }


    async function handleRegenerate() {

        if (!material) {
            return;
        }


        try {

            setRegenerating(
                activeTab
            );

            setError(
                null
            );


            if (
                activeTab ===
                'summary'
            ) {

                const response =
                    await regenerateSummary(
                        videoId
                    );


                setMaterial(
                    current =>
                        current
                            ? {
                                ...current,

                                summary:
                                response.data.summary,

                                status:
                                response.data.status,

                                generationModel:
                                response.data.generationModel,

                                generatedAt:
                                response.data.generatedAt,

                                updatedAt:
                                response.data.updatedAt
                            }
                            : current
                );

            }


            if (
                activeTab ===
                'mindMap'
            ) {

                const response =
                    await regenerateMindMap(
                        videoId
                    );


                setMaterial(
                    current =>
                        current
                            ? {
                                ...current,

                                mindMap:
                                response.data.mindMap,

                                status:
                                response.data.status,

                                generationModel:
                                response.data.generationModel,

                                generatedAt:
                                response.data.generatedAt,

                                updatedAt:
                                response.data.updatedAt
                            }
                            : current
                );

            }


            if (
                activeTab ===
                'flashcards'
            ) {

                const response =
                    await regenerateFlashcards(
                        videoId
                    );


                setMaterial(
                    current =>
                        current
                            ? {
                                ...current,

                                flashcards:
                                response.data.flashcards,

                                status:
                                response.data.status,

                                generationModel:
                                response.data.generationModel,

                                generatedAt:
                                response.data.generatedAt
                            }
                            : current
                );

            }


        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : 'Erro ao regenerar material.'
            );


        } finally {

            setRegenerating(
                null
            );

        }

    }


    if (loading) {

        return (
            <section className="study-material">

                <p>
                    Carregando material de estudo...
                </p>

            </section>
        );

    }


    if (
        !material ||
        !material.generated
    ) {

        return (
            <section className="study-material">

                <h2>
                    Material de estudo
                </h2>


                <p>
                    Este vídeo ainda não possui
                    material gerado por IA.
                </p>


                {error && (
                    <p className="study-error">
                        {error}
                    </p>
                )}


                <button
                    type="button"
                    onClick={
                        handleGenerate
                    }
                    disabled={
                        generating
                    }
                >

                    {
                        generating
                            ? 'Gerando material...'
                            : '✨ Gerar material com IA'
                    }

                </button>

            </section>
        );

    }


    return (
        <section className="study-material">

            <div className="study-tabs">

                <button
                    type="button"
                    className={
                        activeTab === 'summary'
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
                        activeTab === 'mindMap'
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
                        activeTab === 'flashcards'
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


            <div className="study-actions">

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
                >

                    {
                        regenerating ===
                        activeTab
                            ? 'Regenerando...'
                            : 'Regenerar'
                    }

                </button>

            </div>


            {error && (
                <p className="study-error">
                    {error}
                </p>
            )}


            <div className="study-content">

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