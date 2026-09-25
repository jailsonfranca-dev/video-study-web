export interface MindMapNode {
    title: string;
    description: string;
    children: MindMapNode[];
}


export interface Flashcard {
    id: string;
    position: number;
    question: string;
    answer: string;
}


export type StudyMaterialStatus =
    | 'not_generated'
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed';


export interface StudyMaterial {
    videoId: string;

    generated: boolean;

    transcriptAvailable: boolean;

    status: StudyMaterialStatus;

    summary: string | null;

    mindMap: MindMapNode | null;

    flashcards: Flashcard[];

    generationModel?: string | null;

    errorMessage?: string | null;

    generatedAt?: string | null;

    createdAt?: string | null;

    updatedAt?: string | null;
}


export interface GenerateStudyMaterialResponse {
    message: string;
    material: StudyMaterial;
}


export interface RegenerateSummaryResponse {
    message: string;

    data: {
        videoId: string;
        summary: string;
        generationModel: string;
        status: StudyMaterialStatus;
        generatedAt?: string | null;
        updatedAt?: string | null;
    };
}


export interface RegenerateMindMapResponse {
    message: string;

    data: {
        videoId: string;
        mindMap: MindMapNode;
        generationModel: string;
        status: StudyMaterialStatus;
        generatedAt?: string | null;
        updatedAt?: string | null;
    };
}


export interface RegenerateFlashcardsResponse {
    message: string;

    data: {
        videoId: string;
        studyMaterialId: string;
        flashcards: Flashcard[];
        generationModel: string;
        status: StudyMaterialStatus;
        generatedAt?: string | null;
    };
}