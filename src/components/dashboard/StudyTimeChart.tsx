import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import {
    formatStudyTime
} from '../../utils/formatStudyTime';


interface StudyTimeDay {

    date:
        string;

    day:
        string;

    seconds:
        number;

}


interface StudyTimeChartProps {

    days:
        StudyTimeDay[];

}


export function StudyTimeChart({

                                   days

                               }: StudyTimeChartProps) {

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
                    Tempo estudado
                </h2>

                <p>
                    Tempo efetivo de estudo durante a semana
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
                            left: 4,
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

                            tickFormatter={
                                value =>
                                    formatStudyTime(
                                        Number(
                                            value
                                        )
                                    )
                            }

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
                                    'var(--color-success)'

                            }}

                            formatter={(
                                value
                            ) => [

                                formatStudyTime(
                                    Number(
                                        value
                                    )
                                ),

                                'Tempo estudado'

                            ]}

                        />


                        <Bar

                            dataKey="seconds"

                            name="Tempo estudado"

                            fill={
                                'var(--color-success)'
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