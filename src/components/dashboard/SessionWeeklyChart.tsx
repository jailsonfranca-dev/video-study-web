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


export function SessionWeeklyChart({

                                       days

                                   }: SessionWeeklyChartProps) {

    const data =
        days.map(
            item => ({

                ...item,

                label:
                    item.day
                        .toUpperCase()

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

                            stroke={
                                'var(--color-border)'
                            }

                            strokeDasharray="3 3"

                            vertical={
                                false
                            }

                        />


                        <XAxis

                            dataKey="label"

                            axisLine={{
                                stroke:
                                    'var(--color-border)'
                            }}

                            tickLine={
                                false
                            }

                            tick={{

                                fill:
                                    'var(--color-text-secondary)',

                                fontSize:
                                    12

                            }}

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

                            tick={{

                                fill:
                                    'var(--color-text-secondary)',

                                fontSize:
                                    12

                            }}

                            domain={[
                                0,
                                'auto'
                            ]}

                        />


                        <Tooltip

                            cursor={{

                                fill:
                                    'var(--color-surface-secondary)',

                                opacity:
                                    0.7

                            }}

                            contentStyle={{

                                background:
                                    'var(--color-surface)',

                                border:
                                    '1px solid var(--color-border)',

                                borderRadius:
                                    '10px',

                                color:
                                    'var(--color-text-primary)',

                                boxShadow:
                                    'var(--shadow-md)'

                            }}

                            labelStyle={{

                                color:
                                    'var(--color-text-primary)',

                                fontWeight:
                                    700

                            }}

                            itemStyle={{

                                color:
                                    'var(--color-warning)'

                            }}

                            formatter={(
                                value
                            ) => {

                                const sessions =
                                    Number(
                                        value
                                    );


                                return [

                                    `${sessions} ${
                                        sessions === 1
                                            ? 'sessão'
                                            : 'sessões'
                                    }`,

                                    'Sessões'

                                ];

                            }}

                        />


                        <Bar

                            dataKey="sessions"

                            name="Sessões"

                            fill={
                                'var(--color-warning)'
                            }

                            radius={[
                                7,
                                7,
                                0,
                                0
                            ]}

                            maxBarSize={
                                52
                            }

                            activeBar={{

                                fill:
                                    'var(--color-primary-hover)'

                            }}

                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </section>

    );

}