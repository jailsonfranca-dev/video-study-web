import {
    Link
} from 'react-router-dom';


import type {
    ContinueStudyingVideo
} from '../../types/dashboard';


interface ContinueStudyingProps {

    videos:
        ContinueStudyingVideo[];

}


export function ContinueStudying({
                                     videos
                                 }: ContinueStudyingProps) {

    return (

        <section className="continue-studying-card">

            <div className="dashboard-section-header">

                <div>

                    <h2>
                        Continuar estudando
                    </h2>

                    <p>
                        Retome de onde parou
                    </p>

                </div>

            </div>


            {
                videos.length === 0
                    ? (

                        <p className="dashboard-empty">

                            Nenhuma aula em andamento.

                        </p>

                    )
                    : (

                        <div className="continue-list">

                            {
                                videos.map(
                                    video => (

                                        <article
                                            key={
                                                video.id
                                            }
                                            className="continue-item"
                                        >

                                            <div className="continue-info">

                                                <strong>

                                                    {
                                                        video.name
                                                    }

                                                </strong>


                                                <span>

                                                    {
                                                        video.progressPercent
                                                    }
                                                    %

                                                </span>

                                            </div>


                                            <div className="continue-progress">

                                                <div
                                                    style={{
                                                        width:
                                                            `${Math.min(
                                                                video.progressPercent,
                                                                100
                                                            )}%`
                                                    }}
                                                />

                                            </div>


                                            <Link
                                                to={
                                                    `/watch/${video.id}`
                                                }
                                            >

                                                Continuar ▶

                                            </Link>

                                        </article>

                                    )
                                )
                            }

                        </div>

                    )
            }

        </section>

    );

}