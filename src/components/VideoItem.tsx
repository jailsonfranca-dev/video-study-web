import type {
    Video
} from '../types/library';

import {
    formatVideoName
} from '../utils/formatVideoName';


interface VideoItemProps {
    video: Video;
    onOpen?:
        (video: Video) =>
            void;
}


function formatDuration(
    seconds: number | null
) {

    if (!seconds) {
        return '--:--';
    }


    const total =
        Math.floor(
            seconds
        );


    const hours =
        Math.floor(
            total / 3600
        );


    const minutes =
        Math.floor(
            (total % 3600) / 60
        );


    const remainingSeconds =
        total % 60;


    if (hours > 0) {

        return (
            `${hours}:` +
            String(minutes)
                .padStart(
                    2,
                    '0'
                ) +
            ':' +
            String(
                remainingSeconds
            ).padStart(
                2,
                '0'
            )
        );
    }


    return (
        `${minutes}:` +
        String(
            remainingSeconds
        ).padStart(
            2,
            '0'
        )
    );
}


export function VideoItem({
                              video, onOpen
                          }: VideoItemProps) {

    const {
        progress
    } = video;


    return (

        <button
            type="button"
            className="video-item"
            onClick={
                () =>
                    onOpen?.(
                        video
                    )
            }
        >

            <div
                className={
                    progress.completed
                        ? 'video-status completed'
                        : 'video-status'
                }
            >

                {
                    progress.completed
                        ? '✓'
                        : '▶'
                }

            </div>


            <div
                className="video-info"
            >

                <h3>
                    {formatVideoName(video.name)}
                </h3>


                <div
                    className="video-meta"
                >

                    <span>

                        {
                            formatDuration(
                                video.durationSeconds
                            )
                        }

                    </span>


                    <span>
                        •
                    </span>


                    <span>

                        {
                            progress.percentage
                                .toFixed(1)
                        }%

                    </span>


                    {
                        progress.completed && (

                            <span
                                className="completed-label"
                            >
                                Assistido
                            </span>

                        )
                    }

                </div>


                <div
                    className="progress-track"
                >

                    <div
                        className="progress-fill"
                        style={{
                            width:
                                `${Math.min(
                                    progress.percentage,
                                    100
                                )}%`
                        }}
                    />

                </div>

            </div>

        </button>

    );
}