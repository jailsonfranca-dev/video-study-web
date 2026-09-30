import {
    apiFetch
} from './http';


export interface StudySession {

    id: string;

    videoId: string;

    startedAt: string;

    endedAt:
        string | null;

    watchedSeconds: number;

    startPositionSeconds: number;

    endPositionSeconds:
        number | null;

}


interface StartStudySessionResponse {

    message: string;

    session:
        StudySession;

}


interface UpdateStudySessionResponse {

    message: string;

    session:
        StudySession;

}


interface RequestOptions {

    keepalive?:
        boolean;

}


/*
 * =====================================
 * INICIAR SESSÃO
 * =====================================
 */
export function startStudySession(

    videoId: string,

    startPositionSeconds: number,

    options:
        RequestOptions = {}

) {

    return apiFetch<StartStudySessionResponse>(

        `/library/videos/${videoId}/study-sessions`,

        {

            method:
                'POST',

            body:
                JSON.stringify({

                    startPositionSeconds

                }),

            keepalive:
                options.keepalive ??
                false

        }

    );

}


/*
 * =====================================
 * ADICIONAR TEMPO
 * =====================================
 */
export function addStudySessionTime(

    sessionId: string,

    watchedSeconds: number,

    currentPositionSeconds: number,

    options:
        RequestOptions = {}

) {

    return apiFetch<UpdateStudySessionResponse>(

        `/library/study-sessions/${sessionId}/time`,

        {

            method:
                'PATCH',

            body:
                JSON.stringify({

                    watchedSeconds,

                    currentPositionSeconds

                }),

            keepalive:
                options.keepalive ??
                false

        }

    );

}


/*
 * =====================================
 * FINALIZAR SESSÃO
 * =====================================
 */
export function endStudySession(

    sessionId: string,

    endPositionSeconds: number,

    options:
        RequestOptions = {}

) {

    return apiFetch<UpdateStudySessionResponse>(

        `/library/study-sessions/${sessionId}/end`,

        {

            method:
                'PATCH',

            body:
                JSON.stringify({

                    endPositionSeconds

                }),

            keepalive:
                options.keepalive ??
                false

        }

    );

}