import {
    useEffect,
    useRef
} from 'react';


import type {
    RefObject
} from 'react';


import {
    registerStudyTime
} from '../api/studyTimeApi';


const SEND_INTERVAL_SECONDS =
    15;


const SAMPLE_INTERVAL_MS =
    1000;


/*
 * Proteção contra situações em que
 * o navegador congela/throttla timers.
 */
const MAX_SAMPLE_SECONDS =
    2.5;


interface UseStudyTimeTrackerParams {

    videoId:
        string | undefined;

    videoRef:
        RefObject<HTMLVideoElement | null>;

}


export function useStudyTimeTracker({

                                        videoId,

                                        videoRef

                                    }: UseStudyTimeTrackerParams) {

    /*
     * Segundos ainda não enviados
     * ao backend.
     */
    const pendingSecondsRef =
        useRef(
            0
        );


    /*
     * Evita duas requisições de
     * heartbeat simultâneas.
     */
    const sendingRef =
        useRef(
            false
        );


    /*
     * Se houver pause/ended enquanto
     * uma requisição estiver rodando,
     * solicitamos um flush depois.
     */
    const forceFlushRequestedRef =
        useRef(
            false
        );


    /*
     * Última posição conhecida
     * do vídeo.
     */
    const lastMediaTimeRef =
        useRef<number | null>(
            null
        );


    /*
     * Último instante real medido.
     */
    const lastWallTimeRef =
        useRef<number | null>(
            null
        );


    useEffect(
        () => {

            if (!videoId) {

                return;

            }


            const trackedVideoId =
                videoId;


            let disposed =
                false;


            /*
             * Começamos uma nova sessão
             * para este vídeo.
             */
            pendingSecondsRef.current =
                0;


            sendingRef.current =
                false;


            forceFlushRequestedRef.current =
                false;


            lastMediaTimeRef.current =
                null;


            lastWallTimeRef.current =
                null;


            function resetSample() {

                const video =
                    videoRef.current;


                lastMediaTimeRef.current =
                    video
                        ? video.currentTime
                        : null;


                lastWallTimeRef.current =
                    performance.now();

            }


            async function flush(
                force = false
            ) {

                if (
                    sendingRef.current
                ) {

                    if (force) {

                        forceFlushRequestedRef.current =
                            true;

                    }


                    return;

                }


                const wholeSeconds =
                    Math.floor(
                        pendingSecondsRef.current
                    );


                /*
                 * Normal:
                 * envia a cada 15 segundos.
                 *
                 * Force:
                 * envia até mesmo 1 segundo
                 * restante.
                 */
                if (
                    !force &&
                    wholeSeconds <
                    SEND_INTERVAL_SECONDS
                ) {

                    return;

                }


                if (
                    force &&
                    wholeSeconds < 1
                ) {

                    return;

                }


                let secondsToSend;


                if (force) {

                    secondsToSend =
                        Math.min(
                            wholeSeconds,
                            60
                        );

                } else {

                    secondsToSend =
                        Math.floor(
                            wholeSeconds /
                            SEND_INTERVAL_SECONDS
                        )
                        *
                        SEND_INTERVAL_SECONDS;


                    secondsToSend =
                        Math.min(
                            secondsToSend,
                            60
                        );

                }


                if (
                    secondsToSend < 1
                ) {

                    return;

                }


                /*
                 * Remove antes da chamada.
                 *
                 * Em caso de erro,
                 * adicionamos novamente.
                 */
                pendingSecondsRef.current -=
                    secondsToSend;


                sendingRef.current =
                    true;


                try {

                    await registerStudyTime(

                        trackedVideoId,

                        secondsToSend

                    );


                } catch (error) {

                    /*
                     * Não perde os segundos
                     * se a rede falhar.
                     */
                    if (!disposed) {

                        pendingSecondsRef.current +=
                            secondsToSend;

                    }


                    console.warn(
                        'Não foi possível registrar o tempo de estudo.',
                        error
                    );


                } finally {

                    sendingRef.current =
                        false;


                    if (disposed) {

                        return;

                    }


                    if (
                        forceFlushRequestedRef.current
                    ) {

                        forceFlushRequestedRef.current =
                            false;


                        void flush(
                            true
                        );


                    } else if (
                        pendingSecondsRef.current >=
                        SEND_INTERVAL_SECONDS
                    ) {

                        void flush();

                    }

                }

            }


            /*
             * Faz uma amostra da reprodução.
             */
            function samplePlayback() {

                const video =
                    videoRef.current;


                if (!video) {

                    return;

                }


                const now =
                    performance.now();


                const currentMediaTime =
                    video.currentTime;


                const previousMediaTime =
                    lastMediaTimeRef.current;


                const previousWallTime =
                    lastWallTimeRef.current;


                /*
                 * Atualizamos as referências
                 * independentemente de contar
                 * ou não.
                 */
                lastMediaTimeRef.current =
                    currentMediaTime;


                lastWallTimeRef.current =
                    now;


                /*
                 * Primeira amostra.
                 */
                if (
                    previousMediaTime === null ||
                    previousWallTime === null
                ) {

                    return;

                }


                /*
                 * Condições necessárias para
                 * considerar que o usuário
                 * está realmente assistindo.
                 */
                const canCount =

                    !video.paused &&

                    !video.ended &&

                    !video.seeking &&

                    !document.hidden &&

                    video.readyState >=
                    HTMLMediaElement
                        .HAVE_CURRENT_DATA;


                if (!canCount) {

                    return;

                }


                const mediaDelta =
                    currentMediaTime -
                    previousMediaTime;


                const wallDelta =
                    (
                        now -
                        previousWallTime
                    )
                    /
                    1000;


                /*
                 * Se a posição não avançou,
                 * provavelmente houve
                 * buffering.
                 */
                if (
                    mediaDelta <= 0 ||
                    wallDelta <= 0
                ) {

                    return;

                }


                /*
                 * Detecta um salto muito grande
                 * na posição.
                 *
                 * Exemplo:
                 *
                 * 05:00 → 25:00
                 *
                 * Isso foi seek, não
                 * 20 minutos assistidos.
                 */
                const maximumExpectedMediaDelta =
                    Math.max(

                        4,

                        video.playbackRate *
                        wallDelta *
                        3

                    );


                if (
                    mediaDelta >
                    maximumExpectedMediaDelta
                ) {

                    return;

                }


                /*
                 * Contamos TEMPO REAL,
                 * não duração do conteúdo.
                 *
                 * Se assistir em 2x durante
                 * 1 segundo:
                 *
                 * tempo estudado = 1 segundo.
                 */
                const countedSeconds =
                    Math.min(

                        wallDelta,

                        MAX_SAMPLE_SECONDS

                    );


                pendingSecondsRef.current +=
                    countedSeconds;


                /*
                 * A cada ~15 segundos,
                 * manda para o backend.
                 */
                if (
                    pendingSecondsRef.current >=
                    SEND_INTERVAL_SECONDS
                ) {

                    void flush();

                }

            }


            /*
             * Eventos que interrompem ou
             * reiniciam a medição.
             */
            function handlePlay() {

                resetSample();

            }


            function handlePlaying() {

                resetSample();

            }


            function handlePause() {

                resetSample();


                void flush(
                    true
                );

            }


            function handleEnded() {

                resetSample();


                void flush(
                    true
                );

            }


            function handleSeeking() {

                /*
                 * Importantíssimo:
                 * resetamos para que um salto
                 * no vídeo não seja contabilizado.
                 */
                resetSample();

            }


            function handleSeeked() {

                resetSample();

            }


            function handleWaiting() {

                /*
                 * Buffering.
                 */
                resetSample();

            }


            function handleStalled() {

                resetSample();

            }


            function handleVisibilityChange() {

                resetSample();


                if (
                    document.hidden
                ) {

                    void flush(
                        true
                    );

                }

            }


            /*
             * Intervalo de amostragem.
             */
            const intervalId =
                window.setInterval(

                    samplePlayback,

                    SAMPLE_INTERVAL_MS

                );


            /*
             * Como o elemento pode já
             * existir, adicionamos os
             * listeners nele.
             */
            const video =
                videoRef.current;


            if (video) {

                video.addEventListener(
                    'play',
                    handlePlay
                );


                video.addEventListener(
                    'playing',
                    handlePlaying
                );


                video.addEventListener(
                    'pause',
                    handlePause
                );


                video.addEventListener(
                    'ended',
                    handleEnded
                );


                video.addEventListener(
                    'seeking',
                    handleSeeking
                );


                video.addEventListener(
                    'seeked',
                    handleSeeked
                );


                video.addEventListener(
                    'waiting',
                    handleWaiting
                );


                video.addEventListener(
                    'stalled',
                    handleStalled
                );

            }


            document.addEventListener(
                'visibilitychange',
                handleVisibilityChange
            );


            /*
             * Inicializa referências.
             */
            resetSample();


            return () => {

                disposed =
                    true;


                window.clearInterval(
                    intervalId
                );


                if (video) {

                    video.removeEventListener(
                        'play',
                        handlePlay
                    );


                    video.removeEventListener(
                        'playing',
                        handlePlaying
                    );


                    video.removeEventListener(
                        'pause',
                        handlePause
                    );


                    video.removeEventListener(
                        'ended',
                        handleEnded
                    );


                    video.removeEventListener(
                        'seeking',
                        handleSeeking
                    );


                    video.removeEventListener(
                        'seeked',
                        handleSeeked
                    );


                    video.removeEventListener(
                        'waiting',
                        handleWaiting
                    );


                    video.removeEventListener(
                        'stalled',
                        handleStalled
                    );

                }


                document.removeEventListener(
                    'visibilitychange',
                    handleVisibilityChange
                );


                /*
                 * Últimos segundos ainda
                 * não enviados.
                 */
                const remainingSeconds =
                    Math.min(

                        Math.floor(
                            pendingSecondsRef.current
                        ),

                        60

                    );


                if (
                    remainingSeconds > 0
                ) {

                    pendingSecondsRef.current -=
                        remainingSeconds;


                    /*
                     * keepalive permite que o
                     * navegador tente finalizar
                     * a requisição mesmo durante
                     * uma navegação.
                     */
                    void registerStudyTime(

                        trackedVideoId,

                        remainingSeconds,

                        {
                            keepalive:
                                true
                        }

                    ).catch(
                        error => {

                            console.warn(
                                'Não foi possível enviar o tempo restante.',
                                error
                            );

                        }
                    );

                }


                lastMediaTimeRef.current =
                    null;


                lastWallTimeRef.current =
                    null;

            };

        },
        [
            videoId,
            videoRef
        ]
    );

}