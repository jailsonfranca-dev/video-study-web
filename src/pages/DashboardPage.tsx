import {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    getDashboardSummary,
    getWeeklyActivity,
    getCalendarActivity,
    getContinueStudying,
    getRecentActivity,
    getStudyTime,
    getStudySessions,
    syncGoogleDrive,
    updateWeeklyGoal,
    updateStudyTimeGoal,
    getSessionStats
} from '../api/dashboardApi';

import type {
    DashboardSummary,
    WeeklyActivityDay,
    CalendarActivityDay,
    ContinueStudyingVideo,
    RecentActivityItem,
    StudyTimeMetrics,
    StudySessionItem,
    SessionStats
} from '../types/dashboard';

import {
    WeeklyStudyChart
} from '../components/dashboard/WeeklyStudyChart';

import {
    StudyCalendar
} from '../components/dashboard/StudyCalendar';

import {
    ContinueStudying
} from '../components/dashboard/ContinueStudying';

import {
    DriveSyncCard
} from '../components/dashboard/DriveSyncCard';

import {
    RecentActivity
} from '../components/dashboard/RecentActivity';

import {
    StudyTimeChart
} from '../components/dashboard/StudyTimeChart';

import {
    StudySessionHistory
} from '../components/dashboard/StudySessionHistory';

import {
    formatStudyTime
} from '../utils/formatStudyTime';

import {
    SessionWeeklyChart
} from '../components/dashboard/SessionWeeklyChart';

import {
    DashboardSectionHeader
} from '../components/dashboard/DashboardSectionHeader';

import {
    DashboardEmptyState
} from '../components/dashboard/DashboardEmptyState';

import {
    DashboardSkeleton
} from '../components/dashboard/DashboardSkeleton';

import '../components/dashboard/DashboardPage.css';


export function DashboardPage() {

    /*
     * =====================================
     * META SEMANAL DE AULAS
     * =====================================
     */

    const [
        editingWeeklyGoal,
        setEditingWeeklyGoal
    ] =
        useState(
            false
        );


    const [
        weeklyGoalInput,
        setWeeklyGoalInput
    ] =
        useState(
            ''
        );


    const [
        savingWeeklyGoal,
        setSavingWeeklyGoal
    ] =
        useState(
            false
        );


    /*
     * =====================================
     * MÉTRICAS DE SESSÕES
     * =====================================
     */

    const [
        sessionStats,
        setSessionStats
    ] =
        useState<SessionStats | null>(
            null
        );


    /*
     * =====================================
     * META SEMANAL DE TEMPO
     * =====================================
     */

    const [
        editingStudyTimeGoal,
        setEditingStudyTimeGoal
    ] =
        useState(
            false
        );


    const [
        studyTimeGoalHours,
        setStudyTimeGoalHours
    ] =
        useState(
            ''
        );


    const [
        savingStudyTimeGoal,
        setSavingStudyTimeGoal
    ] =
        useState(
            false
        );


    /*
     * =====================================
     * DADOS DO DASHBOARD
     * =====================================
     */

    const [
        summary,
        setSummary
    ] =
        useState<DashboardSummary | null>(
            null
        );


    const [
        week,
        setWeek
    ] =
        useState<WeeklyActivityDay[]>(
            []
        );


    const [
        calendar,
        setCalendar
    ] =
        useState<CalendarActivityDay[]>(
            []
        );


    const [
        continueVideos,
        setContinueVideos
    ] =
        useState<ContinueStudyingVideo[]>(
            []
        );


    const [
        recentActivities,
        setRecentActivities
    ] =
        useState<RecentActivityItem[]>(
            []
        );


    const [
        studyTime,
        setStudyTime
    ] =
        useState<StudyTimeMetrics | null>(
            null
        );


    const [
        studySessions,
        setStudySessions
    ] =
        useState<StudySessionItem[]>(
            []
        );


    const [
        calendarMonth,
        setCalendarMonth
    ] =
        useState<Date>(
            new Date()
        );


    /*
     * =====================================
     * ESTADOS DA INTERFACE
     * =====================================
     */

    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );


    const [
        syncing,
        setSyncing
    ] =
        useState(
            false
        );


    const [
        syncMessage,
        setSyncMessage
    ] =
        useState<string | null>(
            null
        );


    const [
        error,
        setError
    ] =
        useState<string | null>(
            null
        );


    /*
     * =====================================
     * CARREGAR DASHBOARD
     * =====================================
     */

    const loadDashboard =
        useCallback(
            async (
                signal?: AbortSignal
            ) => {

                const [
                    summaryResult,
                    weekResult,
                    continueResult,
                    recentActivityResult,
                    studyTimeResult,
                    studySessionsResult,
                    sessionStatsResult
                ] =

                    await Promise.all([

                        getDashboardSummary(
                            signal
                        ),

                        getWeeklyActivity(
                            signal
                        ),

                        getContinueStudying(
                            signal
                        ),

                        getRecentActivity(
                            signal
                        ),

                        getStudyTime(
                            signal
                        ),

                        getStudySessions(
                            20,
                            signal
                        ),

                        getSessionStats(
                            signal
                        )

                    ]);


                if (!summaryResult) {

                    throw new Error(
                        'O resumo do dashboard não foi retornado.'
                    );

                }


                setSummary(
                    summaryResult
                );


                setWeek(
                    weekResult?.days ??
                    []
                );


                setContinueVideos(
                    continueResult?.videos ??
                    []
                );


                setRecentActivities(
                    recentActivityResult?.activities ??
                    []
                );


                setStudyTime(
                    studyTimeResult
                );


                setStudySessions(
                    studySessionsResult?.sessions ??
                    []
                );


                setSessionStats(
                    sessionStatsResult
                );

            },
            []
        );


    /*
     * =====================================
     * CARREGAR CALENDÁRIO
     * =====================================
     */

    const loadCalendar =
        useCallback(
            async (
                month: Date,
                signal?: AbortSignal
            ) => {

                const result =
                    await getCalendarActivity(

                        month.getFullYear(),

                        month.getMonth() + 1,

                        signal

                    );


                setCalendar(
                    result?.days ??
                    []
                );

            },
            []
        );


    /*
     * =====================================
     * PRIMEIRA CARGA
     * =====================================
     */

    useEffect(
        () => {

            const controller =
                new AbortController();


            async function load() {

                try {

                    setLoading(
                        true
                    );


                    setError(
                        null
                    );


                    await loadDashboard(
                        controller.signal
                    );


                } catch (error) {

                    if (
                        error instanceof DOMException &&
                        error.name ===
                        'AbortError'
                    ) {

                        return;

                    }


                    setError(

                        error instanceof Error
                            ? error.message
                            : 'Erro ao carregar dashboard.'

                    );


                } finally {

                    if (
                        !controller.signal.aborted
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            }


            void load();


            return () => {

                controller.abort();

            };

        },
        [
            loadDashboard
        ]
    );


    /*
     * =====================================
     * CALENDÁRIO
     * =====================================
     */

    useEffect(
        () => {

            const controller =
                new AbortController();


            async function load() {

                try {

                    await loadCalendar(
                        calendarMonth,
                        controller.signal
                    );


                } catch (error) {

                    if (
                        error instanceof DOMException &&
                        error.name ===
                        'AbortError'
                    ) {

                        return;

                    }


                    setError(

                        error instanceof Error
                            ? error.message
                            : 'Erro ao carregar calendário.'

                    );

                }

            }


            void load();


            return () => {

                controller.abort();

            };

        },
        [
            calendarMonth,
            loadCalendar
        ]
    );


    /*
     * =====================================
     * ALTERAR MÊS
     * =====================================
     */

    function handleMonthChange(
        month: Date
    ) {

        setCalendarMonth(
            month
        );

    }


    /*
     * =====================================
     * META SEMANAL DE TEMPO
     * =====================================
     */

    function handleStartStudyTimeGoalEdit() {

        if (!studyTime) {

            return;

        }


        const hours =
            studyTime
                .weeklyGoal
                .targetMinutes /
            60;


        setStudyTimeGoalHours(
            String(
                hours
            )
        );


        setEditingStudyTimeGoal(
            true
        );


        setError(
            null
        );

    }


    function handleCancelStudyTimeGoalEdit() {

        setEditingStudyTimeGoal(
            false
        );


        setStudyTimeGoalHours(
            ''
        );


        setError(
            null
        );

    }


    async function handleSaveStudyTimeGoal() {

        const hours =
            Number(
                studyTimeGoalHours
            );


        if (
            !Number.isFinite(
                hours
            )
            ||
            hours <= 0
            ||
            hours > 168
        ) {

            setError(
                'A meta semanal deve estar entre 0,1 e 168 horas.'
            );

            return;

        }


        const targetMinutes =
            Math.round(
                hours *
                60
            );


        try {

            setSavingStudyTimeGoal(
                true
            );


            setError(
                null
            );


            await updateStudyTimeGoal(
                targetMinutes
            );


            const updatedStudyTime =
                await getStudyTime();


            setStudyTime(
                updatedStudyTime
            );


            setEditingStudyTimeGoal(
                false
            );


            setStudyTimeGoalHours(
                ''
            );


        } catch (error) {

            setError(

                error instanceof Error
                    ? error.message
                    : 'Não foi possível atualizar a meta semanal de tempo.'

            );


        } finally {

            setSavingStudyTimeGoal(
                false
            );

        }

    }


    /*
     * =====================================
     * META SEMANAL DE AULAS
     * =====================================
     */

    function handleStartWeeklyGoalEdit() {

        if (!summary) {

            return;

        }


        setWeeklyGoalInput(
            String(
                summary
                    .weeklyGoal
                    .target
            )
        );


        setEditingWeeklyGoal(
            true
        );


        setError(
            null
        );

    }


    function handleCancelWeeklyGoalEdit() {

        setEditingWeeklyGoal(
            false
        );


        setWeeklyGoalInput(
            ''
        );


        setError(
            null
        );

    }


    async function handleSaveWeeklyGoal() {

        const target =
            Number(
                weeklyGoalInput
            );


        if (
            !Number.isInteger(
                target
            )
            ||
            target < 1
            ||
            target > 100
        ) {

            setError(
                'A meta semanal deve estar entre 1 e 100 aulas.'
            );

            return;

        }


        try {

            setSavingWeeklyGoal(
                true
            );


            setError(
                null
            );


            await updateWeeklyGoal(
                target
            );


            const result =
                await getDashboardSummary();


            if (!result) {

                throw new Error(
                    'Não foi possível atualizar o resumo do dashboard.'
                );

            }


            setSummary(
                result
            );


            setEditingWeeklyGoal(
                false
            );


            setWeeklyGoalInput(
                ''
            );


        } catch (error) {

            setError(

                error instanceof Error
                    ? error.message
                    : 'Erro ao atualizar meta semanal.'

            );


        } finally {

            setSavingWeeklyGoal(
                false
            );

        }

    }


    /*
     * =====================================
     * FORMATAR MELHOR DIA
     * =====================================
     */

    function formatBestDay(
        dateValue: string | null
    ) {

        if (!dateValue) {

            return '—';

        }


        const datePart =
            dateValue.slice(
                0,
                10
            );


        const date =
            new Date(
                `${datePart}T12:00:00`
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return '—';

        }


        return date.toLocaleDateString(
            'pt-BR',
            {

                weekday:
                    'long',

                day:
                    '2-digit',

                month:
                    '2-digit'

            }
        );

    }


    /*
     * =====================================
     * FORMATAR HORÁRIO FAVORITO
     * =====================================
     */

    function formatFavoriteStudyHour(
        hour:
            number | null
    ) {

        if (
            hour === null ||
            hour === undefined
        ) {

            return '—';

        }


        const nextHour =
            (
                hour + 1
            ) % 24;


        return (
            `${String(hour).padStart(2, '0')}h` +
            '–' +
            `${String(nextHour).padStart(2, '0')}h`
        );

    }


    /*
     * =====================================
     * SINCRONIZAR GOOGLE DRIVE
     * =====================================
     */

    async function handleSync() {

        try {

            setSyncing(
                true
            );


            setSyncMessage(
                null
            );


            setError(
                null
            );


            await syncGoogleDrive();


            setSyncMessage(
                'Biblioteca sincronizada com sucesso.'
            );


            await Promise.all([

                loadDashboard(),

                loadCalendar(
                    calendarMonth
                )

            ]);


        } catch (error) {

            setError(

                error instanceof Error
                    ? error.message
                    : 'Erro ao sincronizar Google Drive.'

            );


        } finally {

            setSyncing(
                false
            );

        }

    }


    /*
     * =====================================
     * LOADING
     * =====================================
     */

    if (loading) {

        return (

            <div className="dashboard-page">

                <DashboardSkeleton />

            </div>

        );

    }


    /*
     * =====================================
     * DASHBOARD
     * =====================================
     */

    return (

        <div className="dashboard-page">

            <header className="dashboard-title">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Acompanhe seu progresso de estudos.
                    </p>

                </div>

            </header>


            {
                error && (

                    <div className="dashboard-error">

                        {error}

                    </div>

                )
            }


            {/*
             * =================================
             * VISÃO GERAL
             * =================================
             */}

            <DashboardSectionHeader
                title="Visão geral"
                description="Resumo do seu progresso e desempenho nos estudos."
            />


            {
                summary && (

                    <section className="dashboard-stats">

                        {/* HOJE */}

                        <article className="dashboard-stat-card">

                            <span>
                                Hoje
                            </span>

                            <strong>

                                {
                                    summary
                                        .today
                                        .completedVideos
                                }

                            </strong>

                            <small>
                                aulas concluídas
                            </small>

                        </article>


                        {/* ESTA SEMANA */}

                        <article className="dashboard-stat-card">

                            <span>
                                Esta semana
                            </span>

                            <strong>

                                {
                                    summary
                                        .week
                                        .completedVideos
                                }

                            </strong>

                            <small>
                                aulas concluídas
                            </small>

                        </article>


                        {/* META SEMANAL */}

                        <article className="dashboard-stat-card">

                            <div className="dashboard-stat-header">

                                <span>
                                    Meta semanal
                                </span>


                                {
                                    !editingWeeklyGoal && (

                                        <button

                                            type="button"

                                            className="weekly-goal-edit-button"

                                            onClick={
                                                handleStartWeeklyGoalEdit
                                            }

                                        >

                                            Editar

                                        </button>

                                    )
                                }

                            </div>


                            {
                                editingWeeklyGoal
                                    ? (

                                        <div className="weekly-goal-form">

                                            <input

                                                type="number"

                                                min="1"

                                                max="100"

                                                value={
                                                    weeklyGoalInput
                                                }

                                                onChange={
                                                    event =>
                                                        setWeeklyGoalInput(
                                                            event.target.value
                                                        )
                                                }

                                                disabled={
                                                    savingWeeklyGoal
                                                }

                                                autoFocus

                                            />


                                            <div className="weekly-goal-actions">

                                                <button

                                                    type="button"

                                                    onClick={
                                                        handleSaveWeeklyGoal
                                                    }

                                                    disabled={
                                                        savingWeeklyGoal
                                                    }

                                                >

                                                    {
                                                        savingWeeklyGoal
                                                            ? 'Salvando...'
                                                            : 'Salvar'
                                                    }

                                                </button>


                                                <button

                                                    type="button"

                                                    onClick={
                                                        handleCancelWeeklyGoalEdit
                                                    }

                                                    disabled={
                                                        savingWeeklyGoal
                                                    }

                                                >

                                                    Cancelar

                                                </button>

                                            </div>

                                        </div>

                                    )
                                    : (

                                        <>

                                            <strong>

                                                {
                                                    summary
                                                        .weeklyGoal
                                                        .completed
                                                }

                                                /

                                                {
                                                    summary
                                                        .weeklyGoal
                                                        .target
                                                }

                                            </strong>


                                            <div className="dashboard-total-progress">

                                                <div
                                                    style={{

                                                        width:
                                                            `${summary.weeklyGoal.progressPercent}%`

                                                    }}
                                                />

                                            </div>


                                            <small>

                                                {
                                                    summary
                                                        .weeklyGoal
                                                        .achieved

                                                        ? '🎉 Meta concluída!'

                                                        : `${summary.weeklyGoal.remaining} aulas restantes`
                                                }

                                            </small>

                                        </>

                                    )
                            }

                        </article>


                        {/* SEQUÊNCIA */}

                        <article className="dashboard-stat-card">

                            <span>
                                Sequência
                            </span>

                            <strong>

                                🔥{' '}

                                {
                                    summary
                                        .streak
                                        .days
                                }

                            </strong>

                            <small>

                                {
                                    summary
                                        .streak
                                        .days ===
                                    1

                                        ? 'dia seguido'

                                        : 'dias seguidos'
                                }

                            </small>

                        </article>


                        {/* SEMANA ANTERIOR */}

                        <article className="dashboard-stat-card">

                            <span>
                                Semana anterior
                            </span>


                            <strong
                                className={
                                    `comparison-${summary.comparison.trend}`
                                }
                            >

                                {
                                    summary
                                        .comparison
                                        .trend ===
                                    'up'
                                    &&
                                    '↑ '
                                }


                                {
                                    summary
                                        .comparison
                                        .trend ===
                                    'down'
                                    &&
                                    '↓ '
                                }


                                {
                                    summary
                                        .comparison
                                        .trend ===
                                    'same'
                                    &&
                                    '→ '
                                }


                                {
                                    summary
                                        .comparison
                                        .difference >
                                    0
                                        ? '+'
                                        : ''
                                }


                                {
                                    summary
                                        .comparison
                                        .difference
                                }

                            </strong>


                            <small>

                                {
                                    summary
                                        .comparison
                                        .changePercent !==
                                    null

                                        ? `${
                                            summary
                                                .comparison
                                                .changePercent >
                                            0
                                                ? '+'
                                                : ''
                                        }${
                                            summary
                                                .comparison
                                                .changePercent
                                        }% vs. semana anterior`

                                        : `${
                                            summary
                                                .comparison
                                                .previousWeek
                                        } aulas na semana anterior`
                                }

                            </small>

                        </article>


                        {/* PROGRESSO GERAL */}

                        <article className="dashboard-stat-card">

                            <span>
                                Progresso geral
                            </span>

                            <strong>

                                {
                                    summary
                                        .library
                                        .progressPercent
                                }

                                %

                            </strong>


                            <div className="dashboard-total-progress">

                                <div
                                    style={{

                                        width:
                                            `${summary.library.progressPercent}%`

                                    }}
                                />

                            </div>


                            <small>

                                {
                                    summary
                                        .library
                                        .completedVideos
                                }

                                {' '}de{' '}

                                {
                                    summary
                                        .library
                                        .totalVideos
                                }

                                {' '}aulas

                            </small>

                        </article>

                    </section>

                )
            }


            {/*
             * =================================
             * GRÁFICO + CALENDÁRIO
             * =================================
             */}

            <section className="dashboard-main-grid">

                <WeeklyStudyChart
                    days={
                        week
                    }
                />


                <StudyCalendar

                    days={
                        calendar
                    }

                    month={
                        calendarMonth
                    }

                    onMonthChange={
                        handleMonthChange
                    }

                />

            </section>


            {/*
             * =================================
             * ESTUDOS
             * =================================
             */}

            <DashboardSectionHeader
                title="Estudos"
                description="Retome suas aulas e acompanhe suas atividades mais recentes."
            />


            {
                continueVideos.length > 0
                    ? (

                        <ContinueStudying
                            videos={
                                continueVideos
                            }
                        />

                    )
                    : (

                        <DashboardEmptyState

                            icon="▶️"

                            title="Nenhuma aula em andamento"

                            description="Você ainda não iniciou nenhuma aula ou já concluiu todas as aulas iniciadas."

                            actionLabel="Ir para a Biblioteca"

                            actionTo="/library"

                        />

                    )
            }


            {
                recentActivities.length > 0
                    ? (

                        <RecentActivity
                            activities={
                                recentActivities
                            }
                        />

                    )
                    : (

                        <DashboardEmptyState

                            icon="🕘"

                            title="Nenhuma atividade recente"

                            description="Quando você começar ou concluir uma aula, sua atividade aparecerá aqui."

                            actionLabel="Escolher uma aula"

                            actionTo="/library"

                        />

                    )
            }


            {/*
             * =================================
             * SESSÕES DE ESTUDO
             * =================================
             */}

            <DashboardSectionHeader
                title="Sessões de estudo"
                description="Acompanhe quando e por quanto tempo você realmente estudou."
            />


            {
                studySessions.length > 0
                    ? (

                        <StudySessionHistory
                            sessions={
                                studySessions
                            }
                        />

                    )
                    : (

                        <DashboardEmptyState

                            icon="⏱️"

                            title="Nenhuma sessão registrada"

                            description="Assista a uma aula por alguns segundos para começar seu histórico de sessões de estudo."

                            actionLabel="Começar a estudar"

                            actionTo="/library"

                        />

                    )
            }


            {
                sessionStats && (

                    <section className="session-stats-grid">

                        {/* SESSÕES HOJE */}

                        <article className="dashboard-stat-card">

                            <span>
                                Sessões hoje
                            </span>

                            <strong>

                                {
                                    sessionStats
                                        .today
                                        .sessions
                                }

                            </strong>

                            <small>

                                {
                                    sessionStats
                                        .today
                                        .sessions ===
                                    1

                                        ? 'sessão registrada'

                                        : 'sessões registradas'
                                }

                            </small>

                        </article>


                        {/* SESSÕES SEMANA */}

                        <article className="dashboard-stat-card">

                            <span>
                                Sessões na semana
                            </span>

                            <strong>

                                {
                                    sessionStats
                                        .week
                                        .sessions
                                }

                            </strong>

                            <small>
                                desde segunda-feira
                            </small>

                        </article>


                        {/* MÉDIA */}

                        <article className="dashboard-stat-card">

                            <span>
                                Média por sessão
                            </span>

                            <strong>

                                {
                                    formatStudyTime(
                                        sessionStats
                                            .averageSessionSeconds
                                    )
                                }

                            </strong>

                            <small>
                                tempo médio estudado
                            </small>

                        </article>


                        {/* MAIOR SESSÃO */}

                        <article className="dashboard-stat-card">

                            <span>
                                Maior sessão
                            </span>

                            <strong>

                                {
                                    formatStudyTime(
                                        sessionStats
                                            .longestSessionSeconds
                                    )
                                }

                            </strong>

                            <small>
                                sua sessão mais longa
                            </small>

                        </article>


                        {/* HORÁRIO FAVORITO */}

                        <article className="dashboard-stat-card">

                            <span>
                                Horário mais estudado
                            </span>

                            <strong>

                                {
                                    formatFavoriteStudyHour(
                                        sessionStats
                                            .favoriteStudyHour
                                            .hour
                                    )
                                }

                            </strong>

                            <small>

                                {
                                    sessionStats
                                        .favoriteStudyHour
                                        .hour !==
                                    null

                                        ? `${formatStudyTime(
                                            sessionStats
                                                .favoriteStudyHour
                                                .seconds
                                        )} estudados`

                                        : 'sem dados ainda'
                                }

                            </small>

                        </article>

                    </section>

                )
            }


            {
                sessionStats && (

                    <SessionWeeklyChart
                        days={
                            sessionStats.weekDays
                        }
                    />

                )
            }


            {/*
             * =================================
             * TEMPO DE ESTUDO
             * =================================
             */}

            <DashboardSectionHeader
                title="Tempo de estudo"
                description="Veja o tempo efetivo dedicado aos seus estudos."
            />


            {
                studyTime && (

                    <section className="study-time-stats">

                        {/* META SEMANAL DE TEMPO */}

                        <article className="dashboard-stat-card">

                            <div className="dashboard-stat-header">

                                <span>
                                    Meta semanal de tempo
                                </span>


                                {
                                    !editingStudyTimeGoal && (

                                        <button

                                            type="button"

                                            className="weekly-goal-edit-button"

                                            onClick={
                                                handleStartStudyTimeGoalEdit
                                            }

                                        >

                                            Editar

                                        </button>

                                    )
                                }

                            </div>


                            {
                                editingStudyTimeGoal
                                    ? (

                                        <div className="weekly-goal-form">

                                            <div className="study-time-goal-input">

                                                <input

                                                    type="number"

                                                    min="0.1"

                                                    max="168"

                                                    step="0.5"

                                                    value={
                                                        studyTimeGoalHours
                                                    }

                                                    onChange={
                                                        event =>
                                                            setStudyTimeGoalHours(
                                                                event.target.value
                                                            )
                                                    }

                                                    disabled={
                                                        savingStudyTimeGoal
                                                    }

                                                    autoFocus

                                                />


                                                <span>
                                                    horas
                                                </span>

                                            </div>


                                            <div className="weekly-goal-actions">

                                                <button

                                                    type="button"

                                                    onClick={
                                                        handleSaveStudyTimeGoal
                                                    }

                                                    disabled={
                                                        savingStudyTimeGoal
                                                    }

                                                >

                                                    {
                                                        savingStudyTimeGoal
                                                            ? 'Salvando...'
                                                            : 'Salvar'
                                                    }

                                                </button>


                                                <button

                                                    type="button"

                                                    onClick={
                                                        handleCancelStudyTimeGoalEdit
                                                    }

                                                    disabled={
                                                        savingStudyTimeGoal
                                                    }

                                                >

                                                    Cancelar

                                                </button>

                                            </div>

                                        </div>

                                    )
                                    : (

                                        <>

                                            <strong className="study-time-goal-value">

                                                {
                                                    formatStudyTime(
                                                        studyTime
                                                            .weeklyGoal
                                                            .studiedSeconds
                                                    )
                                                }


                                                <span>

                                                    {' / '}

                                                    {
                                                        formatStudyTime(
                                                            studyTime
                                                                .weeklyGoal
                                                                .targetSeconds
                                                        )
                                                    }

                                                </span>

                                            </strong>


                                            <div className="study-time-goal-progress-row">

                                                <div className="study-time-goal-progress">

                                                    <div

                                                        className={
                                                            `study-time-goal-progress-fill ${
                                                                studyTime
                                                                    .weeklyGoal
                                                                    .achieved
                                                                    ? 'completed'
                                                                    : ''
                                                            }`
                                                        }

                                                        style={{

                                                            width:
                                                                `${Math.min(
                                                                    studyTime
                                                                        .weeklyGoal
                                                                        .progressPercent,
                                                                    100
                                                                )}%`

                                                        }}

                                                    />

                                                </div>


                                                <span className="study-time-goal-percent">

                                                    {
                                                        studyTime
                                                            .weeklyGoal
                                                            .progressPercent
                                                            .toFixed(
                                                                1
                                                            )
                                                            .replace(
                                                                '.0',
                                                                ''
                                                            )
                                                    }

                                                    %

                                                </span>

                                            </div>


                                            {
                                                studyTime
                                                    .weeklyGoal
                                                    .achieved
                                                    ? (

                                                        <small className="study-time-goal-achieved">

                                                            🎉 Meta de tempo concluída!

                                                        </small>

                                                    )
                                                    : (

                                                        <small className="study-time-goal-remaining">

                                                            Faltam{' '}

                                                            {
                                                                formatStudyTime(
                                                                    studyTime
                                                                        .weeklyGoal
                                                                        .remainingSeconds
                                                                )
                                                            }

                                                        </small>

                                                    )
                                            }

                                        </>

                                    )
                            }

                        </article>


                        {/* TEMPO HOJE */}

                        <article className="dashboard-stat-card">

                            <span>
                                Tempo hoje
                            </span>

                            <strong>

                                {
                                    formatStudyTime(
                                        studyTime
                                            .today
                                            .seconds
                                    )
                                }

                            </strong>

                            <small>
                                tempo efetivamente estudado
                            </small>

                        </article>


                        {/* ESTA SEMANA */}

                        <article className="dashboard-stat-card">

                            <span>
                                Esta semana
                            </span>

                            <strong>

                                {
                                    formatStudyTime(
                                        studyTime
                                            .week
                                            .seconds
                                    )
                                }

                            </strong>

                            <small>
                                desde segunda-feira
                            </small>

                        </article>


                        {/* TEMPO TOTAL */}

                        <article className="dashboard-stat-card">

                            <span>
                                Tempo total
                            </span>

                            <strong>

                                {
                                    formatStudyTime(
                                        studyTime
                                            .total
                                            .seconds
                                    )
                                }

                            </strong>

                            <small>
                                desde o início do acompanhamento
                            </small>

                        </article>


                        {/* MÉDIA DIÁRIA */}

                        <article className="dashboard-stat-card">

                            <span>
                                Média diária
                            </span>

                            <strong>

                                {
                                    formatStudyTime(
                                        studyTime
                                            .averageDaily
                                            .seconds
                                    )
                                }

                            </strong>

                            <small>
                                média desta semana
                            </small>

                        </article>


                        {/* MELHOR DIA */}

                        <article className="dashboard-stat-card">

                            <span>
                                Melhor dia
                            </span>

                            <strong>

                                {
                                    formatStudyTime(
                                        studyTime
                                            .bestDay
                                            .seconds
                                    )
                                }

                            </strong>

                            <small>

                                {
                                    formatBestDay(
                                        studyTime
                                            .bestDay
                                            .date
                                    )
                                }

                            </small>

                        </article>

                    </section>

                )
            }


            {/*
             * =================================
             * GRÁFICO DE TEMPO
             * =================================
             */}

            {
                studyTime && (

                    <StudyTimeChart
                        days={
                            studyTime.weekDays
                        }
                    />

                )
            }


            {/*
             * =================================
             * BIBLIOTECA
             * =================================
             */}

            <DashboardSectionHeader
                title="Biblioteca"
                description="Gerencie e mantenha sua biblioteca de aulas sincronizada."
            />


            <DriveSyncCard

                syncing={
                    syncing
                }

                message={
                    syncMessage
                }

                onSync={
                    handleSync
                }

            />

        </div>

    );

}