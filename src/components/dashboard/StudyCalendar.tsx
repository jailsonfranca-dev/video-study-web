import {
    useMemo,
    useState
} from 'react';


import {
    DayPicker
} from '@daypicker/react';


import {
    ptBR
} from '@daypicker/react/locale';


import '@daypicker/react/style.css';


import type {
    CalendarActivityDay
} from '../../types/dashboard';


interface StudyCalendarProps {

    days:
        CalendarActivityDay[];

    month:
        Date;

    onMonthChange:
        (
            month:
                Date
        ) => void;

}


function parseDate(
    date:
        string
) {

    const [
        year,
        month,
        day
    ] =
        date
            .substring(
                0,
                10
            )
            .split(
                '-'
            )
            .map(
                Number
            );


    return new Date(
        year,
        month - 1,
        day,
        12
    );

}


function dateKey(
    date:
        Date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
            .padStart(
                2,
                '0'
            );


    const day =
        String(
            date.getDate()
        )
            .padStart(
                2,
                '0'
            );


    return (
        `${year}-${month}-${day}`
    );

}


export function StudyCalendar({

                                  days,

                                  month,

                                  onMonthChange

                              }: StudyCalendarProps) {

    const [
        selectedDate,
        setSelectedDate
    ] =
        useState<Date | null>(
            null
        );


    const activityMap =
        useMemo(
            () => {

                return new Map(
                    days.map(
                        item => [

                            item.date
                                .substring(
                                    0,
                                    10
                                ),

                            item.completed

                        ]
                    )
                );

            },
            [
                days
            ]
        );


    const lowActivity =
        days
            .filter(
                day =>
                    day.completed === 1
            )
            .map(
                day =>
                    parseDate(
                        day.date
                    )
            );


    const mediumActivity =
        days
            .filter(
                day =>
                    day.completed >= 2 &&
                    day.completed <= 3
            )
            .map(
                day =>
                    parseDate(
                        day.date
                    )
            );


    const highActivity =
        days
            .filter(
                day =>
                    day.completed >= 4
            )
            .map(
                day =>
                    parseDate(
                        day.date
                    )
            );


    const selectedCompleted =
        selectedDate
            ? activityMap.get(
            dateKey(
                selectedDate
            )
        ) ?? 0
            : null;


    return (

        <div className="study-calendar-card">

            <div className="dashboard-section-header">

                <div>

                    <h2>
                        Calendário
                    </h2>

                    <p>
                        Dias em que você estudou
                    </p>

                </div>

            </div>


            <DayPicker

                month={
                    month
                }

                onMonthChange={
                    onMonthChange
                }

                locale={
                    ptBR
                }

                weekStartsOn={
                    1
                }

                timeZone=
                    "America/Fortaleza"

                modifiers={{

                    activityLow:
                    lowActivity,

                    activityMedium:
                    mediumActivity,

                    activityHigh:
                    highActivity

                }}

                modifiersClassNames={{

                    activityLow:
                        'calendar-activity-low',

                    activityMedium:
                        'calendar-activity-medium',

                    activityHigh:
                        'calendar-activity-high'

                }}

                onDayClick={
                    day =>
                        setSelectedDate(
                            day
                        )
                }

            />


            <div className="calendar-legend">

                <span>
                    Menos
                </span>

                <span className="calendar-level calendar-level-1" />

                <span className="calendar-level calendar-level-2" />

                <span className="calendar-level calendar-level-3" />

                <span>
                    Mais
                </span>

            </div>


            {
                selectedDate && (

                    <div className="calendar-selected-day">

                        <strong>

                            {
                                selectedDate
                                    .toLocaleDateString(
                                        'pt-BR'
                                    )
                            }

                        </strong>


                        <span>

                            {
                                selectedCompleted ===
                                1

                                    ? '1 aula concluída'

                                    : `${selectedCompleted} aulas concluídas`
                            }

                        </span>

                    </div>

                )
            }

        </div>

    );

}