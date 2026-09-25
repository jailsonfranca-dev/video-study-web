import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import {
    updateVideoDuration
} from '../api/libraryApi';

import {
    updateVideoProgress
} from '../api/progressApi';

import type {
    VideoDetails,
    VideoProgress
} from '../types/library';


interface VideoPlayerProps {

    video:
        VideoDetails;

    progress:
        VideoProgress;

    onProgressChange:
        (
            progress: VideoProgress
        ) => void;

    onDurationChange?:
        (
            durationSeconds: number
        ) => void;
}


export function VideoPlayer({
                                video,
                                progress,
                                onProgressChange,
                                onDurationChange
                            }: VideoPlayerProps) {

    const playerRef =
        useRef<HTMLVideoElement | null>(
            null
        );


    /*
     * Impede aplicar a retomada
     * várias vezes.
     */
    const resumedRef =
        useRef(false);


    /*
     * Evita enviar o mesmo segundo
     * repetidamente.
     */
    const lastSavedSecondRef =
        useRef<number | null>(
            null
        );


    /*
     * Evita vários PATCH simultâneos.
     */
    const savingRef =
        useRef(false);


    const [
        loading,
        setLoading
    ] =
        useState(true);


    const [
        error,
        setError
    ] =
        useState(false);


    const [
        resumeMessage,
        setResumeMessage
    ] =
        useState('');


    /*
     * Sempre que trocar de vídeo
     * reiniciamos os controles.
     */
    useEffect(
        () => {

            resumedRef.current =
                false;

            lastSavedSecondRef.current =
                null;

            savingRef.current =
                false;

            setLoading(
                true
            );

            setError(
                false
            );

            setResumeMessage(
                ''
            );

        },
        [video.id]
    );


    const saveCurrentProgress =
        useCallback(
            async () => {

                const player =
                    playerRef.current;


                if (!player) {

                    return;

                }


                const currentTimeSeconds =
                    Math.floor(
                        player.currentTime
                    );


                if (
                    !Number.isFinite(
                        currentTimeSeconds
                    ) ||
                    currentTimeSeconds < 0
                ) {

                    return;

                }


                /*
                 * Não salva várias vezes
                 * exatamente o mesmo segundo.
                 */
                if (
                    lastSavedSecondRef.current ===
                    currentTimeSeconds
                ) {

                    return;

                }


                if (
                    savingRef.current
                ) {

                    return;

                }


                try {

                    savingRef.current =
                        true;


                    const updatedProgress =
                        await updateVideoProgress(
                            video.id,
                            currentTimeSeconds
                        );


                    lastSavedSecondRef.current =
                        currentTimeSeconds;


                    onProgressChange(
                        updatedProgress
                    );


                    console.log(
                        'Progresso salvo:',
                        updatedProgress
                    );


                } catch (error) {

                    console.error(
                        'Erro ao salvar progresso:',
                        error
                    );


                } finally {

                    savingRef.current =
                        false;

                }

            },
            [
                video.id,
                onProgressChange
            ]
        );


    /*
     * AUTOSAVE:
     *
     * salva a cada 10 segundos
     * enquanto estiver reproduzindo.
     */
    useEffect(
        () => {

            const interval =
                window.setInterval(
                    () => {

                        const player =
                            playerRef.current;


                        if (!player) {

                            return;

                        }


                        if (
                            !player.paused &&
                            !player.ended
                        ) {

                            saveCurrentProgress();

                        }

                    },
                    10000
                );


            return () => {

                window.clearInterval(
                    interval
                );

            };

        },
        [
            saveCurrentProgress
        ]
    );


    async function handleLoadedMetadata() {

        const player =
            playerRef.current;


        if (!player) {

            return;

        }


        setLoading(
            false
        );


        setError(
            false
        );


        /*
         * =================================
         * DESCOBRIR DURAÇÃO
         * =================================
         */

        const detectedDuration =
            Math.round(
                player.duration
            );


        if (
            !video.durationSeconds &&
            Number.isFinite(
                detectedDuration
            ) &&
            detectedDuration > 0
        ) {

            try {

                await updateVideoDuration(
                    video.id,
                    detectedDuration
                );


                onDurationChange?.(
                    detectedDuration
                );


                console.log(
                    'Duração descoberta:',
                    detectedDuration
                );


            } catch (error) {

                console.error(
                    'Erro ao salvar duração:',
                    error
                );

            }

        }


        /*
         * =================================
         * RETOMAR POSIÇÃO
         * =================================
         */

        if (
            resumedRef.current
        ) {

            return;

        }


        resumedRef.current =
            true;


        const savedTime =
            Number(
                progress
                    .currentTimeSeconds ??
                0
            );


        if (
            savedTime <= 0
        ) {

            return;

        }


        let resumeTime =
            savedTime;


        /*
         * Impede posicionar além
         * da duração do vídeo.
         */
        if (
            Number.isFinite(
                player.duration
            )
        ) {

            resumeTime =
                Math.min(
                    savedTime,

                    Math.max(
                        player.duration - 1,
                        0
                    )
                );

        }


        player.currentTime =
            resumeTime;


        const minutes =
            Math.floor(
                resumeTime / 60
            );


        const seconds =
            Math.floor(
                resumeTime % 60
            );


        setResumeMessage(
            `Retomando em ${minutes}:` +
            String(seconds)
                .padStart(
                    2,
                    '0'
                )
        );

    }


    return (

        <>

            <div
                className="player-container"
            >

                <video
                    key={
                        video.id
                    }

                    ref={
                        playerRef
                    }

                    className="video-player"

                    controls

                    preload="metadata"

                    playsInline

                    onLoadedMetadata={
                        handleLoadedMetadata
                    }

                    onCanPlay={
                        () =>
                            setLoading(
                                false
                            )
                    }

                    onWaiting={
                        () =>
                            setLoading(
                                true
                            )
                    }

                    onPlaying={
                        () =>
                            setLoading(
                                false
                            )
                    }

                    /*
                     * Salva imediatamente
                     * quando o usuário pausa.
                     */
                    onPause={
                        saveCurrentProgress
                    }

                    /*
                     * Salva no final também.
                     */
                    onEnded={
                        saveCurrentProgress
                    }

                    onError={
                        () => {

                            setLoading(
                                false
                            );

                            setError(
                                true
                            );

                        }
                    }
                >

                    <source
                        src={
                            `/library/videos/${video.id}/stream`
                        }

                        type={
                            video.mimeType ||
                            'video/mp4'
                        }
                    />

                    Seu navegador não suporta reprodução de vídeo.

                </video>


                {
                    loading &&
                    !error && (

                        <div
                            className="player-loading"
                        >

                            <div
                                className="loading-spinner"
                            />

                            <span>
                                Carregando vídeo...
                            </span>

                        </div>

                    )
                }


                {
                    error && (

                        <div
                            className="player-error"
                        >

                            Não foi possível carregar o vídeo.

                        </div>

                    )
                }

            </div>


            {
                resumeMessage && (

                    <div
                        className="resume-message"
                    >
                        {resumeMessage}
                    </div>

                )
            }

        </>

    );
}