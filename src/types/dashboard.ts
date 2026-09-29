export interface DashboardSummary {

    today: {
        completedVideos: number;
    };


    week: {
        completedVideos: number;
    };


    weeklyGoal: {
        target: number;
        completed: number;
        remaining: number;
        progressPercent: number;
        achieved: boolean;
    };


    streak: {
        days: number;
    };


    comparison: {
        currentWeek: number;
        previousWeek: number;
        difference: number;
        changePercent: number | null;

        trend:
            | 'up'
            | 'down'
            | 'same';
    };


    library: {
        totalVideos: number;
        completedVideos: number;
        progressPercent: number;
    };
}


/*
 * Um dia do gráfico semanal.
 *
 * Exemplo:
 * {
 *   date: "2026-09-27",
 *   day: "dom",
 *   completed: 3
 * }
 */
export interface WeeklyActivityDay {

    date: string;

    day:
        | 'seg'
        | 'ter'
        | 'qua'
        | 'qui'
        | 'sex'
        | 'sab'
        | 'dom';

    completed: number;
}


/*
 * Resposta completa de:
 *
 * GET /dashboard/week
 */
export interface WeeklyActivity {

    days: WeeklyActivityDay[];

}


/*
 * Atividade de um único dia
 * do calendário.
 */
export interface CalendarActivityDay {

    date: string;

    completed: number;
}


/*
 * Resposta de:
 *
 * GET /dashboard/calendar
 */
export interface CalendarActivity {

    year: number;

    month: number;

    days: CalendarActivityDay[];
}


/*
 * Vídeo que aparece na seção:
 *
 * "Continuar estudando"
 */
export interface ContinueStudyingVideo {

    id: string;

    name: string;


    folderId:
        string | null;


    folderName:
        string | null;


    durationSeconds:
        number | null;


    currentTimeSeconds:
        number;


    progressPercent:
        number;
}


/*
 * Resposta completa de:
 *
 * GET /dashboard/continue-studying
 */
export interface ContinueStudying {

    videos: ContinueStudyingVideo[];
}


/*
 * Resposta da sincronização
 * do Google Drive.
 */
export interface DriveSyncResponse {

    message?: string;

    [key: string]: unknown;
}

export interface UpdateWeeklyGoalResponse {

    message: string;

    weeklyGoal: {
        target: number;
    };

}

export interface RecentActivityItem {

    videoId: string;

    videoName: string;

    folderId:
        string | null;

    folderName:
        string | null;

    durationSeconds:
        number | null;

    currentTimeSeconds:
        number;

    progressPercent:
        number;

    completed:
        boolean;

    activityType:
        'watched' |
        'completed';

    lastWatchedAt:
        string | null;

    completedAt:
        string | null;

    activityAt:
        string | null;
}


export interface RecentActivityResponse {

    activities:
        RecentActivityItem[];

}

export interface StudyTimeDay {
    date: string;
    day:
        | 'seg'
        | 'ter'
        | 'qua'
        | 'qui'
        | 'sex'
        | 'sab'
        | 'dom';
    seconds: number;
}


export interface StudyTimeMetrics {

    today: {
        seconds: number;
    };

    week: {
        seconds: number;
    };

    total: {
        seconds: number;
    };

    averageDaily: {
        seconds: number;
    };

    bestDay: {
        date: string | null;
        seconds: number;
    };

    weekDays:
        StudyTimeDay[];

}