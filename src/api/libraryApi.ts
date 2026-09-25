import {
    apiFetch
} from './http';

import type {
    Folder,
    FolderApiResponse,
    FolderContents,
    FolderContentsApiResponse,
    LibraryRootResponse,
    Video,
    VideoDetails,
    VideoDetailsApiResponse
} from '../types/library';
import {naturalSort} from "../utils/naturalSort.ts";





function normalizeFolder(
    folder: FolderApiResponse
): Folder {

    const parentFolderId =
        folder.parentFolderId ??
        folder.parent_folder_id ??
        null;


    return {

        id:
            String(
                folder.id
            ),

        name:
        folder.name,

        parentFolderId:
            parentFolderId !== null
                ? String(
                    parentFolderId
                )
                : null,

        folderCount:
            Number(
                folder.folder_count ??
                0
            ),

        videoCount:
            Number(
                folder.video_count ??
                0
            )
    };
}


function normalizeVideo(
    video: Video
): Video {

    return {

        ...video,

        id:
            String(
                video.id
            ),

        folderId:
            String(
                video.folderId
            ),

        durationSeconds:
            video.durationSeconds !== null
                ? Number(
                    video.durationSeconds
                )
                : null,

        progress: {

            currentTimeSeconds:
                Number(
                    video.progress
                        ?.currentTimeSeconds ??
                    0
                ),

            percentage:
                Number(
                    video.progress
                        ?.percentage ??
                    0
                ),

            completed:
                Boolean(
                    video.progress
                        ?.completed
                ),

            lastWatchedAt:
                video.progress
                    ?.lastWatchedAt ??
                null
        }
    };
}


export async function getRootFolders(
    signal?: AbortSignal
): Promise<Folder[]> {

    const response =
        await apiFetch<LibraryRootResponse>(
            '/library/folders',
            {
                signal
            }
        );


    return response.folders.map(
        normalizeFolder
    );
}


export async function getFolderContents(
    folderId: string,
    signal?: AbortSignal
): Promise<FolderContents> {

    console.log(
        'ENTROU getFolderContents',
        folderId
    );

    const response =
        await apiFetch<FolderContentsApiResponse>(
            `/library/folders/${folderId}`,
            {
                signal
            }
        );


    return {

        folder: {

            id:
                String(
                    response.folder.id
                ),

            name:
            response.folder.name,

            parentFolderId:
                response.folder
                    .parentFolderId !== null
                    ? String(
                        response.folder
                            .parentFolderId
                    )
                    : null
        },


        folders:
            response.folders
                .map(
                    normalizeFolder
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        naturalSort(
                            a.name,
                            b.name
                        )
                ),


        videos:
            response.videos
                .map(
                    normalizeVideo
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        naturalSort(
                            a.name,
                            b.name
                        )
                )
    };
}

export async function getVideoById(
    videoId: string,
    signal?: AbortSignal
): Promise<VideoDetails> {

    const response =
        await apiFetch<VideoDetailsApiResponse>(
            `/library/videos/${videoId}`,
            {
                signal
            }
        );


    return {

        id:
            String(
                response.id
            ),

        name:
        response.name,

        mimeType:
        response.mimeType,

        durationSeconds:
            response.durationSeconds !== null
                ? Number(
                    response.durationSeconds
                )
                : null,

        sizeBytes:
        response.sizeBytes,

        folder: {

            id:
                String(
                    response.folder.id
                ),

            name:
            response.folder.name
        },

        createdAt:
        response.createdAt,

        updatedAt:
        response.updatedAt
    };
}

export async function updateVideoDuration(
    videoId: string,
    durationSeconds: number
) {

    return apiFetch<{
        id: string;
        name: string;
        durationSeconds: number;
        updatedAt: string;
    }>(
        `/library/videos/${videoId}/duration`,
        {
            method: 'PATCH',

            body:
                JSON.stringify({
                    durationSeconds
                })
        }
    );
}