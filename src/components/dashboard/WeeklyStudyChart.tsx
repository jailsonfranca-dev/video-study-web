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
    WeeklyActivityDay
} from '../../types/dashboard';


interface WeeklyStudyChartProps {

    days:
        WeeklyActivityDay[];

}


export function WeeklyStudyChart({

                                     days

                                 }: WeeklyStudyChartProps) {

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

        <section className="dashboard-chart">

            <div>

                <h2>
                    Aulas assistidas
                </h2>

                <p>
                    Conclusões durante esta semana
                </p>

            </div>


            <div className="weekly-chart-container">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart

                        data={
                            data
                        }

                        margin={{
                            top: 24,
                            right: 12,
                            left: -8,
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
                                    'var(--color-primary)'

                            }}

                            formatter={(
                                value
                            ) => [

                                `${Number(value)} ${
                                    Number(value) === 1
                                        ? 'aula'
                                        : 'aulas'
                                }`,

                                'Concluídas'

                            ]}

                        />


                        <Bar

                            dataKey="completedVideos"

                            name="Aulas concluídas"

                            fill={
                                'var(--color-primary)'
                            }

                            radius={[
                                7,
                                7,
                                0,
                                0
                            ]}

                            maxBarSize={
                                58
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