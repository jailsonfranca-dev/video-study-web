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
    syncGoogleDrive,
    updateWeeklyGoal
} from '../api/dashboardApi';


import type {
    DashboardSummary,
    WeeklyActivityDay,
    CalendarActivityDay,
    ContinueStudyingVideo
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


import '../components/dashboard/DashboardPage.css';


export function DashboardPage() {

    /*
     * =========================
     * META SEMANAL
     * =========================
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
     * =========================
     * DADOS DO DASHBOARD
     * =========================
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
        calendarMonth,
        setCalendarMonth
    ] =
        useState<Date>(
            new Date()
        );


    /*
     * =========================
     * ESTADOS DE INTERFACE
     * =========================
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
     * =========================
     * CARREGAR DASHBOARD
     * =========================
     */

    const loadDashboard =
        useCallback(
            async (
                signal?:
                    AbortSignal
            ) => {

                const [
                    summaryResult,
                    weekResult,
                    continueResult
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

            },
            []
        );


    /*
     * =========================
     * CARREGAR CALENDÁRIO
     * =========================
     */

    const loadCalendar =
        useCallback(
            async (
                month:
                    Date,

                signal?:
                    AbortSignal
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
     * =========================
     * PRIMEIRA CARGA
     * =========================
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


            load();


            return () => {

                controller.abort();

            };

        },
        [
            loadDashboard
        ]
    );


    /*
     * Carrega o calendário
     * sempre que o mês mudar.
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


            load();


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
     * =========================
     * ALTERAR MÊS
     * =========================
     */

    function handleMonthChange(
        month:
            Date
    ) {

        setCalendarMonth(
            month
        );

    }


    /*
     * =========================
     * EDITAR META SEMANAL
     * =========================
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


    /*
     * =========================
     * SALVAR META SEMANAL
     * =========================
     */

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


            /*
             * Busca novamente o resumo
             * porque o backend recalcula:
             *
             * target
             * completed
             * remaining
             * progressPercent
             * achieved
             */
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
     * =========================
     * SINCRONIZAR GOOGLE DRIVE
     * =========================
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


            /*
             * Após sincronizar:
             *
             * - atualiza totais
             * - atualiza vídeos
             * - atualiza calendário
             */
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
     * =========================
     * LOADING
     * =========================
     */

    if (loading) {

        return (

            <div className="dashboard-page">

                <p>
                    Carregando dashboard...
                </p>

            </div>

        );

    }


    /*
     * =========================
     * DASHBOARD
     * =========================
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


            {
                summary && (

                    <section className="dashboard-stats">


                        {/* =========================
                            HOJE
                        ========================== */}

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


                        {/* =========================
                            ESTA SEMANA
                        ========================== */}

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


                        {/* =========================
                            META SEMANAL
                        ========================== */}

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
                                                            event
                                                                .target
                                                                .value
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
                                                            `${
                                                                summary
                                                                    .weeklyGoal
                                                                    .progressPercent
                                                            }%`
                                                    }}
                                                />

                                            </div>


                                            <small>

                                                {
                                                    summary
                                                        .weeklyGoal
                                                        .achieved

                                                        ? '🎉 Meta concluída!'

                                                        : `${
                                                            summary
                                                                .weeklyGoal
                                                                .remaining
                                                        } aulas restantes`
                                                }

                                            </small>

                                        </>

                                    )
                            }

                        </article>


                        {/* =========================
                            SEQUÊNCIA
                        ========================== */}

                        <article className="dashboard-stat-card">

                            <span>
                                Sequência
                            </span>


                            <strong>

                                🔥

                                {' '}

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


                        {/* =========================
                            COMPARAÇÃO
                        ========================== */}

                        <article className="dashboard-stat-card">

                            <span>
                                Semana anterior
                            </span>


                            <strong
                                className={
                                    `comparison-${
                                        summary
                                            .comparison
                                            .trend
                                    }`
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


                        {/* =========================
                            PROGRESSO GERAL
                        ========================== */}

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
                                            `${
                                                summary
                                                    .library
                                                    .progressPercent
                                            }%`
                                    }}
                                />

                            </div>


                            <small>

                                {
                                    summary
                                        .library
                                        .completedVideos
                                }

                                {' '}

                                de

                                {' '}

                                {
                                    summary
                                        .library
                                        .totalVideos
                                }

                                {' '}

                                aulas

                            </small>

                        </article>

                    </section>

                )
            }


            {/* =========================
                GRÁFICO + CALENDÁRIO
            ========================== */}

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


            {/* =========================
                GOOGLE DRIVE
            ========================== */}

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


            {/* =========================
                CONTINUAR ESTUDANDO
            ========================== */}

            <ContinueStudying

                videos={
                    continueVideos
                }

            />

        </div>

    );

}