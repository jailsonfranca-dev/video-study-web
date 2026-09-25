import {
    useEffect,
    useState
} from 'react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    getFolderContents,
    getVideoById
} from '../api/libraryApi';

import {
    PlaylistItem
} from '../components/PlaylistItem';

import {
    VideoPlayer
} from '../components/VideoPlayer';

import type {
    FolderContents,
    Video,
    VideoDetails,
    VideoProgress
} from '../types/library';

import {
    getVideoProgress,
    markVideoCompleted,
    markVideoIncomplete
} from '../api/progressApi';

import {
    Breadcrumbs
} from '../components/Breadcrumbs';

import {
    formatVideoName
} from '../utils/formatVideoName';

import {
    StudyMaterialPanel
} from '../components/study/StudyMaterialPanel';


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
            String(
                minutes
            ).padStart(
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


export function WatchPage() {

    const {
        videoId
    } =
        useParams<{
            videoId: string;
        }>();

    const [
        progress,
        setProgress
    ] = useState<VideoProgress | null>(
        null
    );




    const navigate =
        useNavigate();


    const [
        video,
        setVideo
    ] =
        useState<
            VideoDetails | null
        >(
            null
        );


    const [
        folder,
        setFolder
    ] =
        useState<
            FolderContents | null
        >(
            null
        );


    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );


    const [
        error,
        setError
    ] =
        useState('');


    useEffect(
        () => {

            if (!videoId) {

                return;

            }


            const controller =
                new AbortController();


            async function loadWatchPage() {

                try {

                    setLoading(
                        true
                    );

                    setError(
                        ''
                    );


                    /*
                     * Primeiro descobrimos
                     * a pasta do vídeo.
                     */
                    const videoResult =
                        await getVideoById(
                            videoId!,
                            controller.signal
                        );


                    if (
                        controller
                            .signal
                            .aborted
                    ) {

                        return;

                    }


                    setVideo(
                        videoResult
                    );


                    /*
                     * Depois carregamos todos
                     * os vídeos daquela pasta
                     * para montar a playlist.
                     */
                    const [
                        folderResult,
                        progressResult
                    ] =
                        await Promise.all([

                            getFolderContents(
                                videoResult.folder.id,
                                controller.signal
                            ),

                            getVideoProgress(
                                videoId!,
                                controller.signal
                            )

                        ]);


                    setFolder(
                        folderResult
                    );


                    setProgress(
                        progressResult
                    );


                    if (
                        controller
                            .signal
                            .aborted
                    ) {

                        return;

                    }


                } catch (error) {

                    if (
                        error instanceof DOMException &&
                        error.name ===
                        'AbortError'
                    ) {

                        return;

                    }


                    if (
                        error instanceof Error
                    ) {

                        setError(
                            error.message
                        );

                    } else {

                        setError(
                            'Não foi possível carregar o vídeo.'
                        );

                    }


                } finally {

                    if (
                        !controller
                            .signal
                            .aborted
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            }


            loadWatchPage();


            return () => {

                controller.abort();

            };

        },
        [videoId]
    );

    function handleProgressChange(
        updatedProgress: VideoProgress
    ) {

        /*
         * Atualiza informações abaixo
         * do player.
         */
        setProgress(
            updatedProgress
        );


        /*
         * Atualiza também o vídeo
         * na playlist.
         */
        setFolder(
            current => {

                if (!current) {

                    return current;

                }


                return {

                    ...current,

                    videos:
                        current.videos.map(
                            item => {

                                if (
                                    item.id !==
                                    videoId
                                ) {

                                    return item;

                                }


                                return {

                                    ...item,

                                    progress:
                                    updatedProgress

                                };

                            }
                        )

                };

            }
        );
    }

    function handleDurationChange(
        durationSeconds: number
    ) {

        setVideo(
            current => {

                if (!current) {

                    return current;

                }


                return {

                    ...current,

                    durationSeconds

                };

            }
        );


        setFolder(
            current => {

                if (!current) {

                    return current;

                }


                return {

                    ...current,

                    videos:
                        current.videos.map(
                            item => {

                                if (
                                    item.id !==
                                    videoId
                                ) {

                                    return item;

                                }


                                return {

                                    ...item,

                                    durationSeconds

                                };

                            }
                        )

                };

            }
        );
    }

    async function handleToggleCompleted(
        selectedVideo: Video
    ) {

        try {

            const updatedProgress =
                selectedVideo
                    .progress
                    .completed

                    ? await markVideoIncomplete(
                        selectedVideo.id
                    )

                    : await markVideoCompleted(
                        selectedVideo.id
                    );


            /*
             * Atualiza a playlist.
             */
            setFolder(
                current => {

                    if (!current) {

                        return current;

                    }


                    return {

                        ...current,

                        videos:
                            current.videos.map(
                                item => {

                                    if (
                                        item.id !==
                                        selectedVideo.id
                                    ) {

                                        return item;

                                    }


                                    return {

                                        ...item,

                                        progress:
                                        updatedProgress

                                    };

                                }
                            )

                    };

                }
            );


            /*
             * Se o checkbox alterado
             * pertence ao vídeo atual,
             * atualiza também o player.
             */
            if (
                selectedVideo.id ===
                videoId
            ) {

                setProgress(
                    updatedProgress
                );

            }


        } catch (error) {

            console.error(
                'Erro ao alterar status do vídeo:',
                error
            );

        }
    }

    function handlePreviousVideo() {

        if (!previousVideo) {
            return;
        }


        navigate(
            `/watch/${previousVideo.id}`
        );
    }

    //*****************playlistProgress*************************
    const totalVideos =
        folder?.videos.length ?? 0;


    const completedVideos =
        folder?.videos.filter(
            item =>
                item.progress.completed
        ).length ?? 0;


    const playlistProgress =
        totalVideos > 0
            ? (
            completedVideos /
            totalVideos
        ) * 100
            : 0;
    //******************************************

    const playlistCompleted =
        totalVideos > 0 &&
        completedVideos === totalVideos;
    function handleNextVideo() {

        if (!nextVideo) {
            return;
        }


        navigate(
            `/watch/${nextVideo.id}`
        );
    }


    function handleSelectVideo(
        selectedVideo: Video
    ) {

        if (
            selectedVideo.id ===
            videoId
        ) {

            return;

        }


        navigate(
            `/watch/${selectedVideo.id}`
        );
    }


    if (loading) {

        return (

            <main
                className="watch-page"
            >

                <div
                    className="library-message"
                >

                    <div
                        className="loading-spinner"
                    />

                    <p>
                        Carregando vídeo...
                    </p>

                </div>

            </main>

        );
    }


    if (
        error ||
        !video
    ) {

        return (

            <main
                className="watch-page"
            >

                <button
                    className="back-button"
                    onClick={
                        () =>
                            navigate(
                                '/library'
                            )
                    }
                >
                    ← Biblioteca
                </button>


                <div
                    className="library-error"
                >

                    <strong>
                        Não foi possível carregar o vídeo.
                    </strong>

                    {
                        error && (
                            <p>
                                {error}
                            </p>
                        )
                    }

                </div>

            </main>

        );

    }


    const currentVideo =
        folder?.videos.find(
            item =>
                item.id ===
                video.id
        );
    //*****************************************
    const currentVideoIndex =
        folder
            ? folder.videos.findIndex(
                item =>
                    item.id === video.id
            )
            : -1;


    const previousVideo =
        currentVideoIndex > 0 &&
        folder
            ? folder.videos[
            currentVideoIndex - 1
                ]
            : null;


    const nextVideo =
        folder &&
        currentVideoIndex >= 0 &&
        currentVideoIndex <
        folder.videos.length - 1
            ? folder.videos[
            currentVideoIndex + 1
                ]
            : null;
    //****************************************





    return (

        <main
            className="watch-page"
        >

            <Breadcrumbs
                items={[
                    {
                        label:
                            'Biblioteca',

                        to:
                            '/library'
                    },

                    {
                        label:
                        video.folder.name,

                        to:
                            `/library/folders/${video.folder.id}`
                    },

                    {
                        label:
                            formatVideoName(
                                video.name
                            )
                    }
                ]}
            />


            <div
                className="watch-layout"
            >

                <section
                    className="watch-main"
                >

                    {
                        progress && (

                            <VideoPlayer
                                video={
                                    video
                                }

                                progress={
                                    progress
                                }

                                onProgressChange={
                                    handleProgressChange
                                }

                                onDurationChange={
                                    handleDurationChange
                                }
                            />

                        )
                    }


                    <div
                        className="watch-video-info"
                    >

                        <h1>
                            {
                                video.name
                            }
                        </h1>


                        <div
                            className="watch-video-meta"
                        >

                            <span>
                                {
                                    formatDuration(
                                        video.durationSeconds
                                    )
                                }
                            </span>


                            {
                                currentVideo && (

                                    <>
                                        <span>
                                            •
                                        </span>

                                        <span>
                                            {
                                                currentVideo
                                                    .progress
                                                    .percentage
                                                    .toFixed(
                                                        1
                                                    )
                                            }%
                                        </span>
                                    </>

                                )
                            }


                            {
                                currentVideo
                                    ?.progress
                                    .completed && (

                                    <span
                                        className="watch-completed"
                                    >
                                        ✓ Assistido
                                    </span>

                                )
                            }

                        </div>


                        {
                            currentVideo && (

                                <div
                                    className="watch-progress-track"
                                >

                                    <div
                                        className="watch-progress-fill"
                                        style={{
                                            width:
                                                `${Math.min(
                                                    currentVideo
                                                        .progress
                                                        .percentage,
                                                    100
                                                )}%`
                                        }}
                                    />

                                </div>

                            )
                        }

                    </div>

                    <div className="watch-navigation">

                        <button
                            type="button"
                            className="video-navigation-button"
                            disabled={
                                !previousVideo
                            }
                            onClick={
                                handlePreviousVideo
                            }
                        >

        <span>
            ←
        </span>

                            <div>
                                <small>
                                    Anterior
                                </small>

                                <strong>
                                    {
                                        previousVideo
                                            ? formatVideoName(
                                                previousVideo.name
                                            )
                                            : 'Nenhum'
                                    }
                                </strong>
                            </div>

                        </button>


                        <button
                            type="button"
                            className="video-navigation-button next"
                            disabled={
                                !nextVideo
                            }
                            onClick={
                                handleNextVideo
                            }
                        >

                            <div>
                                <small>
                                    Próximo
                                </small>

                                <strong>
                                    {
                                        nextVideo
                                            ? formatVideoName(
                                                nextVideo.name
                                            )
                                            : 'Nenhum'
                                    }
                                </strong>
                            </div>

                            <span>
            →
        </span>

                        </button>

                    </div>

                    {videoId && (
                        <StudyMaterialPanel
                            videoId={videoId}
                        />
                    )}




                </section>


                <aside
                    className="playlist-panel"
                >

                    <div
                        className="playlist-header"
                    >

                        <div>

                            <h2>
                                Playlist
                            </h2>

                            <p>
                                {
                                    folder
                                        ?.folder
                                        .name
                                }
                            </p>

                        </div>


                        <div
                            className={
                                `playlist-progress-circle ${
                                    playlistCompleted
                                        ? 'completed'
                                        : ''
                                }`
                            }
                            style={{
                                '--playlist-progress':
                                    `${playlistProgress * 3.6}deg`
                            } as React.CSSProperties}
                        >


                            <div
                                className="playlist-progress-inner"
                            >

                                <strong>
                                    {
                                        Math.round(
                                            playlistProgress
                                        )
                                    }%
                                </strong>


                                <span>
                                    {completedVideos}/{totalVideos}
                                </span>

                            </div>

                        </div>

                    </div>


                    <div
                        className="playlist-list"
                    >

                        {
                            folder
                                ?.videos
                                .map(
                                    item => (

                                        <PlaylistItem
                                            key={
                                                item.id
                                            }

                                            video={
                                                item
                                            }

                                            active={
                                                item.id ===
                                                video.id
                                            }

                                            onSelect={
                                                handleSelectVideo
                                            }

                                            onToggleCompleted={
                                                handleToggleCompleted
                                            }
                                        />

                                    )
                                )
                        }

                    </div>

                </aside>

            </div>

        </main>

    );
}

