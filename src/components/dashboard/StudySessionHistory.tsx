import {
    Link
} from 'react-router-dom';

import type {
    StudySessionItem
} from '../../types/dashboard';

import {
    formatVideoName
} from '../../utils/formatVideoName';

import {
    formatStudyTime
} from '../../utils/formatStudyTime';


interface StudySessionHistoryProps {

    sessions:
        StudySessionItem[];

}


function formatSessionTime(
    value:
        string | null
) {

    if (!value) {
        return 'Agora';
    }


    const date =
        new Date(
            value
        );


    return date.toLocaleTimeString(
        'pt-BR',
        {
            hour:
                '2-digit',

            minute:
                '2-digit'
        }
    );

}


function getDayLabel(
    dateValue:
        string
) {

    const date =
        new Date(
            `${dateValue}T12:00:00`
        );


    const today =
        new Date();


    const todayDate =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    const sessionDate =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    const difference =
        Math.round(
            (
                todayDate.getTime() -
                sessionDate.getTime()
            )
            /
            86400000
        );


    if (
        difference ===
        0
    ) {

        return 'Hoje';

    }


    if (
        difference ===
        1
    ) {

        return 'Ontem';

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


function groupSessionsByDate(
    sessions:
        StudySessionItem[]
) {

    const groups =
        new Map<
            string,
            StudySessionItem[]
        >();


    for (
        const session
        of sessions
        ) {

        const current =
            groups.get(
                session.studyDate
            ) ??
            [];


        current.push(
            session
        );


        groups.set(
            session.studyDate,
            current
        );

    }


    return Array
        .from(
            groups.entries()
        )
        .map(
            ([
                 date,
                 items
             ]) => ({

                date,

                sessions:
                items

            })
        );

}


export function StudySessionHistory({

                                        sessions

                                    }: StudySessionHistoryProps) {


    const groups =
        groupSessionsByDate(
            sessions
        );


    return (

        <section className="study-session-history-card">

            <div className="dashboard-section-header">

                <div>

                    <h2>
                        Histórico de sessões
                    </h2>

                    <p>
                        Suas sessões recentes de estudo
                    </p>

                </div>

            </div>


            {
                groups.length ===
                0
                    ? (

                        <p className="dashboard-empty">

                            Nenhuma sessão de estudo registrada.

                        </p>

                    )
                    : (

                        <div className="study-session-groups">

                            {
                                groups.map(
                                    group => (

                                        <div
                                            key={
                                                group.date
                                            }
                                            className="study-session-group"
                                        >

                                            <h3 className="study-session-day">

                                                {
                                                    getDayLabel(
                                                        group.date
                                                    )
                                                }

                                            </h3>


                                            <div className="study-session-list">

                                                {
                                                    group.sessions.map(
                                                        session => (

                                                            <Link

                                                                key={
                                                                    session.id
                                                                }

                                                                to={
                                                                    `/watch/${session.videoId}`
                                                                }

                                                                className="study-session-item"

                                                            >

                                                                <div className="study-session-main">

                                                                    {
                                                                        session.folderName && (

                                                                            <div className="study-session-folder">

                                                                                <span>
                                                                                    📁
                                                                                </span>

                                                                                <span>

                                                                                    {
                                                                                        session.folderName
                                                                                    }

                                                                                </span>

                                                                            </div>

                                                                        )
                                                                    }


                                                                    <strong className="study-session-video">

                                                                        {
                                                                            formatVideoName(
                                                                                session.videoName
                                                                            )
                                                                        }

                                                                    </strong>


                                                                    <div className="study-session-period">

                                                                        <span>

                                                                            {
                                                                                formatSessionTime(
                                                                                    session.startedAt
                                                                                )
                                                                            }

                                                                        </span>


                                                                        <span>
                                                                            →
                                                                        </span>


                                                                        <span>

                                                                            {
                                                                                session.status ===
                                                                                'active'

                                                                                    ? 'Agora'

                                                                                    : formatSessionTime(
                                                                                        session.endedAt
                                                                                    )
                                                                            }

                                                                        </span>

                                                                    </div>

                                                                </div>


                                                                <div className="study-session-meta">

                                                                    <strong>

                                                                        {
                                                                            formatStudyTime(
                                                                                session.watchedSeconds
                                                                            )
                                                                        }

                                                                    </strong>


                                                                    <small>

                                                                        {
                                                                            session.status ===
                                                                            'active'
                                                                                ? 'sessão em andamento'
                                                                                : 'estudados'
                                                                        }

                                                                    </small>

                                                                </div>

                                                            </Link>

                                                        )
                                                    )
                                                }

                                            </div>

                                        </div>

                                    )
                                )
                            }

                        </div>

                    )
            }

        </section>

    );

}