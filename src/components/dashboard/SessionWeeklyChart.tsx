import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import type {
    SessionStatsDay
} from '../../types/dashboard';


interface SessionWeeklyChartProps {

    days:
        SessionStatsDay[];

}


interface TooltipProps {

    active?: boolean;

    payload?: Array<{
        value: number;
    }>;

    label?: string;

}


function SessionTooltip({

                            active,

                            payload,

                            label

                        }: TooltipProps) {

    if (
        !active ||
        !payload ||
        payload.length === 0
    ) {

        return null;

    }


    const sessions =
        Number(
            payload[0]?.value ??
            0
        );


    return (

        <div className="session-chart-tooltip">

            <strong>
                {label}
            </strong>

            <span>

                {
                    sessions
                }

                {' '}

                {
                    sessions === 1
                        ? 'sessão'
                        : 'sessões'
                }

            </span>

        </div>

    );

}


export function SessionWeeklyChart({

                                       days

                                   }: SessionWeeklyChartProps) {

    const data =
        days.map(
            item => ({

                ...item,

                label:
                    item.day.toUpperCase()

            })
        );


    return (

        <section className="session-chart-card">

            <div className="session-chart-header">

                <div>

                    <h2>
                        Sessões na semana
                    </h2>

                    <p>
                        Frequência de sessões de estudo por dia
                    </p>

                </div>

            </div>


            {
                data.length === 0
                    ? (

                        <div className="dashboard-empty">

                            Nenhuma sessão encontrada.

                        </div>

                    )
                    : (

                        <div className="session-chart-container">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart

                                    data={
                                        data
                                    }

                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -10,
                                        bottom: 0
                                    }}

                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={
                                            false
                                        }
                                    />


                                    <XAxis

                                        dataKey="label"

                                        axisLine={
                                            false
                                        }

                                        tickLine={
                                            false
                                        }

                                    />


                                    <YAxis

                                        allowDecimals={
                                            false
                                        }

                                        axisLine={
                                            false
                                        }

                                        tickLine={
                                            false
                                        }

                                        domain={[
                                            0,
                                            'auto'
                                        ]}

                                    />


                                    <Tooltip
                                        content={
                                            <SessionTooltip />
                                        }
                                        cursor={{
                                            fill:
                                                'rgba(0, 0, 0, 0.03)'
                                        }}
                                    />


                                    <Bar

                                        dataKey="sessions"

                                        name="Sessões"

                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0
                                        ]}

                                        maxBarSize={
                                            52
                                        }

                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    )
            }

        </section>

    );

}