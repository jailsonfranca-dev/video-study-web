import {

    BarChart,

    Bar,

    XAxis,

    YAxis,

    CartesianGrid,

    Tooltip,

    ResponsiveContainer

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

    return (

        <div className="dashboard-chart">

            <div className="dashboard-section-header">

                <div>

                    <h2>
                        Aulas assistidas
                    </h2>

                    <p>
                        Conclusões durante esta semana
                    </p>

                </div>

            </div>


            <div className="weekly-chart-container">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        data={
                            days
                        }
                        margin={{
                            top:
                                20,

                            right:
                                20,

                            left:
                                0,

                            bottom:
                                0
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={
                                false
                            }
                        />


                        <XAxis
                            dataKey="day"
                        />


                        <YAxis
                            allowDecimals={
                                false
                            }
                            width={
                                35
                            }
                        />


                        <Tooltip
                            formatter={
                                value => [
                                    `${value} aula${Number(value) === 1 ? '' : 's'}`,
                                    'Concluídas'
                                ]
                            }
                        />


                        <Bar
                            dataKey="completed"
                            radius={[
                                8,
                                8,
                                0,
                                0
                            ]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}