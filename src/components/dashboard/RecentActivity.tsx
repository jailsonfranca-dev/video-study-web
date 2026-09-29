import {
    Link
} from 'react-router-dom';


import type {
    RecentActivityItem
} from '../../types/dashboard';


import {
    formatVideoName
} from '../../utils/formatVideoName';


interface RecentActivityProps {

    activities:
        RecentActivityItem[];

}


function formatActivityDate(
    value:
        string | null
) {

    if (!value) {

        return '';

    }


    const date =
        new Date(
            value
        );


    const now =
        new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const activityDay =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    const difference =
        Math.round(
            (
                today.getTime() -
                activityDay.getTime()
            )
            /
            86400000
        );


    const time =
        date.toLocaleTimeString(
            'pt-BR',
            {
                hour:
                    '2-digit',

                minute:
                    '2-digit'
            }
        );


    if (
        difference ===
        0
    ) {

        return `Hoje às ${time}`;

    }


    if (
        difference ===
        1
    ) {

        return `Ontem às ${time}`;

    }


    return date.toLocaleDateString(
        'pt-BR',
        {
            day:
                '2-digit',

            month:
                '2-digit',

            year:
                'numeric',

            hour:
                '2-digit',

            minute:
                '2-digit'
        }
    );

}


function formatProgress(
    value:
        number
) {

    return Number(
        value
    )
        .toFixed(
            1
        )
        .replace(
            '.0',
            ''
        );
}


export function RecentActivity({

                                   activities

                               }: RecentActivityProps) {

    return (

        <section className="recent-activity-card">

            <div className="dashboard-section-header">

                <div>

                    <h2>
                        Atividade recente
                    </h2>

                    <p>
                        Suas últimas aulas estudadas
                    </p>

                </div>

            </div>


            {
                activities.length ===
                0
                    ? (

                        <p className="dashboard-empty">

                            Nenhuma atividade recente.

                        </p>

                    )
                    : (

                        <div className="recent-activity-list">

                            {
                                activities.map(
                                    activity => (

                                        <Link

                                            key={
                                                activity.videoId
                                            }

                                            to={
                                                `/watch/${activity.videoId}`
                                            }

                                            className="recent-activity-item"

                                        >

                                            <div className="recent-activity-main">

                                                {
                                                    activity.folderName && (

                                                        <div className="recent-activity-folder">

                                                            <span>
                                                                📁
                                                            </span>

                                                            <span>
                                                                {
                                                                    activity.folderName
                                                                }
                                                            </span>

                                                        </div>

                                                    )
                                                }


                                                <strong className="recent-activity-video">

                                                    {
                                                        formatVideoName(
                                                            activity.videoName
                                                        )
                                                    }

                                                </strong>


                                                <div className="recent-activity-status">

                                                    {
                                                        activity.completed
                                                            ? (

                                                                <span className="activity-completed">

                                                                    ✓ Aula concluída

                                                                </span>

                                                            )
                                                            : (

                                                                <span className="activity-watched">

                                                                    ▶ Assistiu até

                                                                    {' '}

                                                                    {
                                                                        formatProgress(
                                                                            activity.progressPercent
                                                                        )
                                                                    }

                                                                    %

                                                                </span>

                                                            )
                                                    }

                                                </div>

                                            </div>


                                            <div className="recent-activity-date">

                                                {
                                                    formatActivityDate(
                                                        activity.activityAt
                                                    )
                                                }

                                            </div>

                                        </Link>

                                    )
                                )
                            }

                        </div>

                    )
            }

        </section>

    );

}