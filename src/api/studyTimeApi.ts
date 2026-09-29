import {
    apiFetch
} from './http';


export interface RegisterStudyTimeResponse {

    message: string;

    studyTime: {

        videoId: string;

        studyDate: string;

        addedSeconds: number;

        watchedSeconds: number;

    };

}


interface RegisterStudyTimeOptions {

    keepalive?:
        boolean;

}


export function registerStudyTime(

    videoId:
        string,

    watchedSeconds:
        number,

    options:
        RegisterStudyTimeOptions = {}

) {

    return apiFetch<RegisterStudyTimeResponse>(

        `/library/videos/${videoId}/study-time`,

        {

            method:
                'POST',

            body:
                JSON.stringify({
                    watchedSeconds
                }),

            keepalive:
                options.keepalive ??
                false

        }

    );

}