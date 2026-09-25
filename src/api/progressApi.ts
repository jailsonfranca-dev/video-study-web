import {
    apiFetch
} from './http';

import type {
    VideoProgress
} from '../types/library';


interface ProgressApiResponse {

    videoId:
        string | number;

    currentTimeSeconds:
        number;

    percentage:
        number;

    completed:
        boolean;

    lastWatchedAt:
        string | null;
}


function normalizeProgress(
    progress: ProgressApiResponse
): VideoProgress {

    return {

        currentTimeSeconds:
            Number(
                progress.currentTimeSeconds ??
                0
            ),

        percentage:
            Number(
                progress.percentage ??
                0
            ),

        completed:
            Boolean(
                progress.completed
            ),

        lastWatchedAt:
            progress.lastWatchedAt ??
            null
    };
}


export async function getVideoProgress(
    videoId: string,
    signal?: AbortSignal
): Promise<VideoProgress> {

    const response =
        await apiFetch<ProgressApiResponse>(
            `/library/videos/${videoId}/progress`,
            {
                signal
            }
        );

    return normalizeProgress(
        response
    );
}


export async function updateVideoProgress(
    videoId: string,
    currentTimeSeconds: number
): Promise<VideoProgress> {

    const response =
        await apiFetch<ProgressApiResponse>(
            `/library/videos/${videoId}/progress`,
            {
                method: 'PATCH',

                body:
                    JSON.stringify({
                        currentTimeSeconds
                    })
            }
        );

    return normalizeProgress(
        response
    );
}


export async function markVideoCompleted(
    videoId: string
): Promise<VideoProgress> {

    const response =
        await apiFetch<ProgressApiResponse>(
            `/library/videos/${videoId}/complete`,
            {
                method: 'POST'
            }
        );

    return normalizeProgress(
        response
    );
}


export async function markVideoIncomplete(
    videoId: string
): Promise<VideoProgress> {

    const response =
        await apiFetch<ProgressApiResponse>(
            `/library/videos/${videoId}/complete`,
            {
                method: 'DELETE'
            }
        );

    return normalizeProgress(
        response
    );
}