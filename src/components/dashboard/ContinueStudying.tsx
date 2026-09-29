import {
    Link
} from 'react-router-dom';


import type {
    ContinueStudyingVideo
} from '../../types/dashboard';


import {
    formatVideoName
} from '../../utils/formatVideoName';


interface ContinueStudyingProps {

    videos:
        ContinueStudyingVideo[];

}


export function ContinueStudying({videos}: ContinueStudyingProps) {

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

                                                {
                                                    video.folderName && (

                                                        <div className="continue-folder">

                                                            <span className="continue-folder-icon">
                                                                📁
                                                            </span>

                                                            <span>

                                                                {
                                                                    video.folderName
                                                                }

                                                            </span>

                                                        </div>

                                                    )
                                                }


                                                <strong className="continue-video-name">

                                                    {
                                                        formatVideoName(
                                                            video.name
                                                        )
                                                    }

                                                </strong>


                                                <span className="continue-percentage">

                                                    {
                                                        Number(
                                                            video.progressPercent
                                                        )
                                                            .toFixed(
                                                                1
                                                            )
                                                            .replace(
                                                                '.0',
                                                                ''
                                                            )
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
                                                className="continue-button"
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