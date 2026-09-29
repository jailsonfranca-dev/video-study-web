import {
    apiFetch
} from './http';


import type {

    DashboardSummary,
    WeeklyActivity,
    CalendarActivity,
    ContinueStudying,
    DriveSyncResponse,
    UpdateWeeklyGoalResponse,
    RecentActivityResponse,
    StudyTimeMetrics,
    UpdateStudyTimeGoalResponse

} from '../types/dashboard';




export function getDashboardSummary(
    signal?: AbortSignal
) {

    return apiFetch<DashboardSummary>(
        '/dashboard/summary',
        {
            signal
        }
    );

}


export function getWeeklyActivity(
    signal?: AbortSignal
) {

    return apiFetch<WeeklyActivity>(
        '/dashboard/week',
        {
            signal
        }
    );

}


export function getCalendarActivity(
    year: number,
    month: number,
    signal?: AbortSignal
) {

    return apiFetch<CalendarActivity>(
        `/dashboard/calendar?year=${year}&month=${month}`,
        {
            signal
        }
    );

}


export function getContinueStudying(
    signal?: AbortSignal
) {

    return apiFetch<ContinueStudying>(
        '/dashboard/continue-studying',
        {
            signal
        }
    );

}


export function syncGoogleDrive() {

    const folderId =
        import.meta.env
            .VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID;


    if (!folderId) {

        throw new Error(
            'VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID não configurado.'
        );

    }


    return apiFetch<DriveSyncResponse>(
        `/google/drive/sync/${folderId}`,
        {
            method:
                'POST'
        }
    );

}

export function updateWeeklyGoal(
    target:
        number
) {

    return apiFetch<UpdateWeeklyGoalResponse>(
        '/dashboard/weekly-goal',
        {
            method:
                'PATCH',

            body:
                JSON.stringify({
                    target
                })
        }
    );

}

export function getRecentActivity(
    signal?: AbortSignal
) {

    return apiFetch<RecentActivityResponse>(
        '/dashboard/recent-activity',
        {
            signal
        }
    );

}

export function getStudyTime(
    signal?: AbortSignal
) {

    return apiFetch<StudyTimeMetrics>(
        '/dashboard/study-time',
        {
            signal
        }
    );

}

export function updateStudyTimeGoal(
    targetMinutes: number
) {

    return apiFetch<UpdateStudyTimeGoalResponse>(
        '/dashboard/study-time-goal',
        {

            method:
                'PATCH',

            body:
                JSON.stringify({
                    targetMinutes
                })

        }
    );

}