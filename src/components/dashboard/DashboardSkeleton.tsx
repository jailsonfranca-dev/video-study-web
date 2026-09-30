export function DashboardSkeleton() {

    return (

        <div
            className="dashboard-skeleton"
            aria-hidden="true"
        >

            {/*
             * =================================
             * TÍTULO
             * =================================
             */}

            <div className="dashboard-skeleton-title">

                <div className="skeleton skeleton-title-main" />

                <div className="skeleton skeleton-title-subtitle" />

            </div>


            {/*
             * =================================
             * TÍTULO DA SEÇÃO
             * =================================
             */}

            <div className="dashboard-skeleton-section-header">

                <div className="skeleton skeleton-section-title" />

                <div className="skeleton skeleton-section-description" />

            </div>


            {/*
             * =================================
             * CARDS PRINCIPAIS
             * =================================
             */}

            <section className="dashboard-skeleton-stats">

                {
                    Array.from({
                        length: 6
                    }).map(
                        (_, index) => (

                            <div
                                key={
                                    index
                                }
                                className="dashboard-skeleton-stat-card"
                            >

                                <div className="skeleton skeleton-card-label" />

                                <div className="skeleton skeleton-card-value" />

                                <div className="skeleton skeleton-card-detail" />

                            </div>

                        )
                    )
                }

            </section>


            {/*
             * =================================
             * GRÁFICO + CALENDÁRIO
             * =================================
             */}

            <section className="dashboard-skeleton-main-grid">

                <div className="dashboard-skeleton-panel">

                    <div className="skeleton skeleton-panel-title" />

                    <div className="skeleton skeleton-chart" />

                </div>


                <div className="dashboard-skeleton-panel">

                    <div className="skeleton skeleton-panel-title" />

                    <div className="skeleton skeleton-calendar" />

                </div>

            </section>


            {/*
             * =================================
             * ESTUDOS
             * =================================
             */}

            <div className="dashboard-skeleton-section-header">

                <div className="skeleton skeleton-section-title" />

                <div className="skeleton skeleton-section-description" />

            </div>


            <div className="dashboard-skeleton-wide-card">

                <div className="skeleton skeleton-wide-title" />

                <div className="skeleton skeleton-wide-line" />

                <div className="skeleton skeleton-wide-line-short" />

            </div>


            <div className="dashboard-skeleton-wide-card">

                <div className="skeleton skeleton-wide-title" />

                <div className="skeleton skeleton-wide-line" />

                <div className="skeleton skeleton-wide-line-short" />

            </div>


            {/*
             * =================================
             * SESSÕES
             * =================================
             */}

            <div className="dashboard-skeleton-section-header">

                <div className="skeleton skeleton-section-title" />

                <div className="skeleton skeleton-section-description" />

            </div>


            <div className="dashboard-skeleton-wide-card">

                {
                    Array.from({
                        length: 3
                    }).map(
                        (_, index) => (

                            <div
                                key={
                                    index
                                }
                                className="dashboard-skeleton-session-row"
                            >

                                <div>

                                    <div className="skeleton skeleton-session-title" />

                                    <div className="skeleton skeleton-session-subtitle" />

                                </div>


                                <div className="skeleton skeleton-session-time" />

                            </div>

                        )
                    )
                }

            </div>


            {/*
             * =================================
             * CARDS DE SESSÕES
             * =================================
             */}

            <section className="dashboard-skeleton-session-stats">

                {
                    Array.from({
                        length: 5
                    }).map(
                        (_, index) => (

                            <div
                                key={
                                    index
                                }
                                className="dashboard-skeleton-stat-card"
                            >

                                <div className="skeleton skeleton-card-label" />

                                <div className="skeleton skeleton-card-value" />

                                <div className="skeleton skeleton-card-detail" />

                            </div>

                        )
                    )
                }

            </section>


            {/*
             * =================================
             * GRÁFICO DE SESSÕES
             * =================================
             */}

            <div className="dashboard-skeleton-panel dashboard-skeleton-full">

                <div className="skeleton skeleton-panel-title" />

                <div className="skeleton skeleton-chart-large" />

            </div>


            {/*
             * =================================
             * TEMPO DE ESTUDO
             * =================================
             */}

            <div className="dashboard-skeleton-section-header">

                <div className="skeleton skeleton-section-title" />

                <div className="skeleton skeleton-section-description" />

            </div>


            <section className="dashboard-skeleton-stats">

                {
                    Array.from({
                        length: 6
                    }).map(
                        (_, index) => (

                            <div
                                key={
                                    index
                                }
                                className="dashboard-skeleton-stat-card"
                            >

                                <div className="skeleton skeleton-card-label" />

                                <div className="skeleton skeleton-card-value" />

                                <div className="skeleton skeleton-card-detail" />

                            </div>

                        )
                    )
                }

            </section>


            <div className="dashboard-skeleton-panel dashboard-skeleton-full">

                <div className="skeleton skeleton-panel-title" />

                <div className="skeleton skeleton-chart-large" />

            </div>


            {/*
             * =================================
             * BIBLIOTECA
             * =================================
             */}

            <div className="dashboard-skeleton-section-header">

                <div className="skeleton skeleton-section-title" />

                <div className="skeleton skeleton-section-description" />

            </div>


            <div className="dashboard-skeleton-wide-card">

                <div className="skeleton skeleton-drive-title" />

                <div className="skeleton skeleton-wide-line-short" />

            </div>

        </div>

    );

}