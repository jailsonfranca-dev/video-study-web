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
    StudyTimeDay
} from '../../types/dashboard';

import {
    formatStudyTime
} from '../../utils/formatStudyTime';


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

                minutes:
                    Number(
                        (
                            item.seconds /
                            60
                        ).toFixed(
                            1
                        )
                    )

            })
        );


    return (

        <section
            className="dashboard-panel"
        >

            <div
                className="dashboard-section-header"
            >

                <div>

                    <h2>
                        Tempo estudado
                    </h2>

                    <p>
                        Minutos de estudo durante esta semana
                    </p>

                </div>

            </div>


            <div
                className="dashboard-chart"
            >

                <ResponsiveContainer
                    width="100%"
                    height={240}
                >

                    <BarChart
                        data={
                            data
                        }
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />


                        <XAxis
                            dataKey="day"
                        />


                        <YAxis
                            allowDecimals={false}
                        />


                        <Tooltip

                            formatter={(
                                value
                            ) => {

                                const minutes =
                                    Number(
                                        value ??
                                        0
                                    );


                                return [
                                    formatStudyTime(
                                        Math.round(
                                            minutes *
                                            60
                                        )
                                    ),
                                    'Tempo estudado'
                                ];

                            }}

                        />


                        <Bar
                            dataKey="minutes"
                            radius={[
                                5,
                                5,
                                0,
                                0
                            ]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </section>

    );

}