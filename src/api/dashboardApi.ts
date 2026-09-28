import {
    apiFetch
} from './http';


import type {

    DashboardSummary,
    WeeklyActivity,
    CalendarActivity,
    ContinueStudying,
    DriveSyncResponse,
    UpdateWeeklyGoalResponse

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