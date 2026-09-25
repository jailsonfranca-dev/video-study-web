export interface FolderApiResponse {
    id: string | number;

    name: string;

    parent_folder_id?:
        string | number | null;

    parentFolderId?:
        string | number | null;

    folder_count?:
        string | number | null;

    video_count?:
        string | number | null;
}


export interface Folder {
    id: string;

    name: string;

    parentFolderId:
        string | null;

    folderCount:
        number;

    videoCount:
        number;
}


export interface VideoProgress {
    currentTimeSeconds:
        number;

    percentage:
        number;

    completed:
        boolean;

    lastWatchedAt:
        string | null;
}


export interface Video {
    id: string;

    name: string;

    mimeType:
        string;

    durationSeconds:
        number | null;

    sizeBytes:
        string | number | null;

    folderId:
        string;

    progress:
        VideoProgress;
}


export interface LibraryRootResponse {
    folders:
        FolderApiResponse[];
}


export interface FolderData {
    id: string;

    name: string;

    parentFolderId:
        string | null;
}


export interface FolderContentsApiResponse {

    folder: {
        id:
            string | number;

        name:
            string;

        parentFolderId:
            string | number | null;
    };

    folders:
        FolderApiResponse[];

    videos:
        Video[];
}


export interface FolderContents {
    folder:
        FolderData;

    folders:
        Folder[];

    videos:
        Video[];
}

export interface VideoDetails {

    id: string;

    name: string;

    mimeType: string;

    durationSeconds:
        number | null;

    sizeBytes:
        string | number | null;

    folder: {
        id: string;
        name: string;
    };

    createdAt:
        string | null;

    updatedAt:
        string | null;
}


export interface VideoDetailsApiResponse {

    id:
        string | number;

    name:
        string;

    mimeType:
        string;

    durationSeconds:
        number | null;

    sizeBytes:
        string | number | null;

    folder: {

        id:
            string | number;

        name:
            string;
    };

    createdAt:
        string | null;

    updatedAt:
        string | null;
}