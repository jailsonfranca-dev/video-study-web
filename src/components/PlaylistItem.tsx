import type {
    Video
} from '../types/library';

import {
    formatVideoName
} from '../utils/formatVideoName';


interface PlaylistItemProps {

    video:
        Video;

    active:
        boolean;

    onSelect:
        (video: Video) =>
            void;

    onToggleCompleted:
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


export function PlaylistItem({
                                 video,
                                 active,
                                 onSelect,
                                 onToggleCompleted
                             }: PlaylistItemProps) {

    function handleKeyDown(
        event:
            React.KeyboardEvent<HTMLDivElement>
    ) {

        if (
            event.key ===
            'Enter'
        ) {

            onSelect(
                video
            );

        }

    }


    return (

        <div

            className={
                active
                    ? 'playlist-item active'
                    : 'playlist-item'
            }

            role="button"

            tabIndex={
                0
            }

            onClick={
                () =>
                    onSelect(
                        video
                    )
            }

            onKeyDown={
                handleKeyDown
            }
        >

            <label
                className="playlist-checkbox-wrapper"

                onClick={
                    event =>
                        event.stopPropagation()
                }
            >

                <input

                    type="checkbox"

                    className="playlist-checkbox"

                    checked={
                        video.progress
                            .completed
                    }

                    onChange={
                        () =>
                            onToggleCompleted(
                                video
                            )
                    }

                    aria-label={
                        video.progress.completed
                            ? `Marcar ${formatVideoName(video.name)} como não assistido`
                            : `Marcar ${formatVideoName(video.name)} como assistido`
                    }

                />

            </label>


            <div
                className="playlist-item-content"
            >

                <div
                    className="playlist-video-name"
                >
                    {formatVideoName(video.name)}
                </div>


                <div
                    className="playlist-video-meta"
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
                            video.progress
                                .percentage
                                .toFixed(1)
                        }%

                    </span>


                    {
                        video.progress
                            .completed && (

                            <span>
                                ✓
                            </span>

                        )
                    }

                </div>


                <div
                    className="playlist-progress"
                >

                    <div
                        className="playlist-progress-fill"

                        style={{
                            width:
                                `${Math.min(
                                    video.progress
                                        .percentage,
                                    100
                                )}%`
                        }}
                    />

                </div>

            </div>

        </div>

    );
}