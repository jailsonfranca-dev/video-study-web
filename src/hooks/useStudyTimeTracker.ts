import {
    useEffect,
    useRef
} from 'react';

import type {
    RefObject
} from 'react';

import {
    addStudySessionTime,
    endStudySession,
    startStudySession
} from '../api/studySessionApi';


const SEND_INTERVAL_SECONDS =
    15;


const SAMPLE_INTERVAL_MS =
    1000;


const MAX_SAMPLE_SECONDS =
    2.5;


interface UseStudyTimeTrackerParams {

    videoId:
        string | undefined;

    videoRef:
        RefObject<HTMLVideoElement | null>;

    enabled:
        boolean;

}


export function useStudyTimeTracker({

                                        videoId,

                                        videoRef,

                                        enabled

                                    }: UseStudyTimeTrackerParams) {


    /*
     * =====================================
     * SESSÃO ATUAL
     * =====================================
     */

    const sessionIdRef =
        useRef<string | null>(
            null
        );


    /*
     * Evita dois POST de criação
     * simultâneos.
     */
    const startingSessionRef =
        useRef<Promise<string | null> | null>(
            null
        );


    /*
     * Evita finalizar a mesma sessão
     * duas vezes.
     */
    const endingSessionRef =
        useRef(
            false
        );


    /*
     * =====================================
     * TEMPO PENDENTE
     * =====================================
     */

    const pendingSecondsRef =
        useRef(
            0
        );


    /*
     * Requisição atual de heartbeat.
     */
    const sendingPromiseRef =
        useRef<Promise<void> | null>(
            null
        );


    /*
     * =====================================
     * AMOSTRAGEM DO PLAYER
     * =====================================
     */

    const lastMediaTimeRef =
        useRef<number | null>(
            null
        );


    const lastWallTimeRef =
        useRef<number | null>(
            null
        );


    useEffect(
        () => {

            if (!videoId || !enabled) {

                return;

            }


            const trackedVideoId =
                videoId;


            let disposed =
                false;


            /*
             * Reinicia dados referentes
             * ao vídeo atual.
             */
            sessionIdRef.current =
                null;


            startingSessionRef.current =
                null;


            endingSessionRef.current =
                false;


            pendingSecondsRef.current =
                0;


            sendingPromiseRef.current =
                null;


            lastMediaTimeRef.current =
                null;


            lastWallTimeRef.current =
                null;


            /*
             * =================================
             * POSIÇÃO ATUAL
             * =================================
             */

            function getCurrentPosition() {

                const video =
                    videoRef.current;


                if (!video) {

                    return 0;

                }


                const position =
                    Math.floor(
                        video.currentTime
                    );


                if (
                    !Number.isFinite(
                        position
                    )
                    ||
                    position < 0
                ) {

                    return 0;

                }


                return position;

            }


            /*
             * =================================
             * RESET DA AMOSTRAGEM
             * =================================
             */

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


            /*
             * =================================
             * INICIAR SESSÃO
             * =================================
             */

            async function ensureSession() {

                if (
                    sessionIdRef.current
                ) {

                    return sessionIdRef.current;

                }


                if (
                    startingSessionRef.current
                ) {

                    return startingSessionRef.current;

                }


                const startPosition =
                    getCurrentPosition();


                const startPromise =
                    (
                        async () => {

                            try {

                                const result =
                                    await startStudySession(

                                        trackedVideoId,

                                        startPosition

                                    );


                                const sessionId =
                                    result
                                        .session
                                        .id;


                                /*
                                 * Se o componente tiver
                                 * sido desmontado enquanto
                                 * o POST estava em andamento,
                                 * encerramos a sessão recém
                                 * criada.
                                 */
                                if (disposed) {

                                    void endStudySession(

                                        sessionId,

                                        getCurrentPosition(),

                                        {
                                            keepalive:
                                                true
                                        }

                                    ).catch(
                                        () => {
                                            // best effort
                                        }
                                    );


                                    return null;

                                }


                                sessionIdRef.current =
                                    sessionId;


                                return sessionId;


                            } catch (error) {

                                console.error(
                                    'Erro ao iniciar sessão de estudo:',
                                    error
                                );


                                return null;


                            } finally {

                                startingSessionRef.current =
                                    null;

                            }

                        }
                    )();


                startingSessionRef.current =
                    startPromise;


                return startPromise;

            }


            /*
             * =================================
             * ENVIAR TEMPO PENDENTE
             * =================================
             */

            async function flushPending(
                force = false
            ) {

                /*
                 * Se já existe envio rodando,
                 * aguardamos terminar.
                 */
                if (
                    sendingPromiseRef.current
                ) {

                    await sendingPromiseRef.current;

                }


                const sessionId =
                    sessionIdRef.current;


                if (!sessionId) {

                    return;

                }


                const wholeSeconds =
                    Math.floor(
                        pendingSecondsRef.current
                    );


                /*
                 * Heartbeat normal:
                 * somente depois de 15s.
                 */
                if (
                    !force &&
                    wholeSeconds <
                    SEND_INTERVAL_SECONDS
                ) {

                    return;

                }


                /*
                 * Flush final:
                 * envia até mesmo 1 segundo.
                 */
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
                 * Remove antes da requisição.
                 *
                 * Se ela falhar, devolvemos
                 * os segundos.
                 */
                pendingSecondsRef.current -=
                    secondsToSend;


                const currentPosition =
                    getCurrentPosition();


                const request =
                    (
                        async () => {

                            try {

                                await addStudySessionTime(

                                    sessionId,

                                    secondsToSend,

                                    currentPosition

                                );


                            } catch (error) {

                                /*
                                 * Se ainda estamos na página,
                                 * devolvemos o tempo para
                                 * uma nova tentativa.
                                 */
                                if (!disposed) {

                                    pendingSecondsRef.current +=
                                        secondsToSend;

                                }


                                console.error(
                                    'Erro ao registrar tempo da sessão:',
                                    error
                                );

                            }

                        }
                    )();


                sendingPromiseRef.current =
                    request;


                try {

                    await request;


                } finally {

                    if (
                        sendingPromiseRef.current ===
                        request
                    ) {

                        sendingPromiseRef.current =
                            null;

                    }

                }


                /*
                 * Se estamos finalizando,
                 * pode haver mais de 60s
                 * pendentes.
                 */
                if (
                    force &&
                    pendingSecondsRef.current >= 1
                ) {

                    await flushPending(
                        true
                    );


                } else if (
                    !force &&
                    pendingSecondsRef.current >=
                    SEND_INTERVAL_SECONDS
                ) {

                    await flushPending(
                        false
                    );

                }

            }


            /*
             * =================================
             * FINALIZAR SESSÃO
             * =================================
             */

            async function finishSession() {

                if (
                    endingSessionRef.current
                ) {

                    return;

                }


                endingSessionRef.current =
                    true;


                try {

                    /*
                     * Caso o POST de início ainda
                     * esteja acontecendo, espera.
                     */
                    if (
                        startingSessionRef.current
                    ) {

                        await startingSessionRef.current;

                    }


                    const sessionId =
                        sessionIdRef.current;


                    if (!sessionId) {

                        return;

                    }


                    /*
                     * Antes de fechar a sessão,
                     * manda os segundos restantes.
                     */
                    await flushPending(
                        true
                    );


                    await endStudySession(

                        sessionId,

                        getCurrentPosition()

                    );


                    /*
                     * Só limpa se continuamos
                     * falando da mesma sessão.
                     */
                    if (
                        sessionIdRef.current ===
                        sessionId
                    ) {

                        sessionIdRef.current =
                            null;

                    }


                    pendingSecondsRef.current =
                        0;


                } catch (error) {

                    console.error(
                        'Erro ao finalizar sessão de estudo:',
                        error
                    );


                } finally {

                    endingSessionRef.current =
                        false;


                    resetSample();

                }

            }


            /*
             * =================================
             * AMOSTRAGEM DA REPRODUÇÃO
             * =================================
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
                 * Sempre atualizamos os
                 * pontos de referência.
                 */
                lastMediaTimeRef.current =
                    currentMediaTime;


                lastWallTimeRef.current =
                    now;


                if (
                    previousMediaTime === null ||
                    previousWallTime === null
                ) {

                    return;

                }


                /*
                 * Só contabilizamos quando
                 * existe sessão aberta.
                 */
                if (
                    !sessionIdRef.current
                ) {

                    return;

                }


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


                if (
                    mediaDelta <= 0 ||
                    wallDelta <= 0
                ) {

                    return;

                }


                /*
                 * Detecta salto manual.
                 *
                 * Exemplo:
                 *
                 * 02:00 → 15:00
                 *
                 * Isso não pode virar
                 * 13 minutos estudados.
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
                 * Medimos tempo REAL.
                 *
                 * 1 segundo assistido em 2x
                 * ainda representa 1 segundo
                 * dedicado ao estudo.
                 */
                const countedSeconds =
                    Math.min(

                        wallDelta,

                        MAX_SAMPLE_SECONDS

                    );


                pendingSecondsRef.current +=
                    countedSeconds;


                if (
                    pendingSecondsRef.current >=
                    SEND_INTERVAL_SECONDS
                ) {

                    void flushPending();

                }

            }


            /*
             * =================================
             * EVENTOS
             * =================================
             */

            async function handlePlay() {

                resetSample();


                await ensureSession();


                resetSample();

            }


            async function handlePlaying() {

                resetSample();


                await ensureSession();


                resetSample();

            }


            function handlePause() {

                resetSample();


                void finishSession();

            }


            function handleEnded() {

                resetSample();


                void finishSession();

            }


            function handleSeeking() {

                /*
                 * Apenas reseta a medição.
                 *
                 * Não encerra a sessão.
                 */
                resetSample();

            }


            function handleSeeked() {

                resetSample();

            }


            function handleWaiting() {

                /*
                 * Buffering não conta.
                 */
                resetSample();

            }


            function handleStalled() {

                resetSample();

            }


            function handleVisibilityChange() {

                resetSample();


                /*
                 * Ao sair da aba, encerramos
                 * a sessão atual.
                 */
                if (
                    document.hidden
                ) {

                    void finishSession();


                    return;

                }


                /*
                 * Se voltou para a aba e
                 * o vídeo continua tocando,
                 * inicia nova sessão.
                 */
                const video =
                    videoRef.current;


                if (
                    video &&
                    !video.paused &&
                    !video.ended
                ) {

                    void ensureSession();

                }

            }


            /*
             * =================================
             * INTERVALO
             * =================================
             */

            const intervalId =
                window.setInterval(

                    samplePlayback,

                    SAMPLE_INTERVAL_MS

                );


            /*
             * =================================
             * LISTENERS
             * =================================
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


            resetSample();


            /*
             * =================================
             * CLEANUP
             * =================================
             */

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
                 * =================================
                 * ÚLTIMO ENVIO
                 * =================================
                 *
                 * Em unmount não podemos depender
                 * de operações React assíncronas.
                 *
                 * Fazemos best effort com keepalive.
                 */

                const sessionId =
                    sessionIdRef.current;


                if (!sessionId) {

                    return;

                }


                const remainingSeconds =
                    Math.min(

                        Math.floor(
                            pendingSecondsRef.current
                        ),

                        60

                    );


                const endPosition =
                    getCurrentPosition();


                /*
                 * Remove os segundos antes de
                 * disparar o envio final.
                 */
                if (
                    remainingSeconds > 0
                ) {

                    pendingSecondsRef.current -=
                        remainingSeconds;


                    void (
                        async () => {

                            try {

                                /*
                                 * Primeiro envia o tempo.
                                 */
                                await addStudySessionTime(

                                    sessionId,

                                    remainingSeconds,

                                    endPosition,

                                    {
                                        keepalive:
                                            true
                                    }

                                );


                                /*
                                 * Depois encerra.
                                 */
                                await endStudySession(

                                    sessionId,

                                    endPosition,

                                    {
                                        keepalive:
                                            true
                                    }

                                );


                            } catch (error) {

                                console.warn(
                                    'Não foi possível encerrar a sessão durante a navegação.',
                                    error
                                );

                            }

                        }
                    )();


                } else {

                    void endStudySession(

                        sessionId,

                        endPosition,

                        {
                            keepalive:
                                true
                        }

                    ).catch(
                        error => {

                            console.warn(
                                'Não foi possível encerrar a sessão durante a navegação.',
                                error
                            );

                        }
                    );

                }

            };

        },
        [
            videoId,
            videoRef,
            enabled
        ]
    );

}