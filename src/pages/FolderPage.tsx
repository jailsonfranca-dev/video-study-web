import {
    useEffect,
    useState
} from 'react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    getFolderContents
} from '../api/libraryApi';

import {
    FolderCard
} from '../components/FolderCard.tsx';

import {
    VideoItem
} from '../components/VideoItem.tsx';

import type {
    Folder,
    FolderContents
} from '../types/library.ts';


export function FolderPage() {

    const {
        folderId
    } =
        useParams<{
            folderId: string;
        }>();
    console.log(
        '[FolderPage render]',
        folderId
    );


    const navigate =
        useNavigate();


    const [
        data,
        setData
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

            if (!folderId) {
                return;
            }


            const currentFolderId =
                folderId;


            async function loadFolder() {

                console.log(
                    '[FolderPage] INICIO',
                    currentFolderId
                );


                try {

                    console.log(
                        '[FolderPage] antes da API'
                    );


                    const result =
                        await getFolderContents(
                            currentFolderId
                        );


                    console.log(
                        '[FolderPage] resposta:',
                        result
                    );


                    setData(
                        result
                    );


                } catch (error) {

                    console.error(
                        '[FolderPage] ERRO:',
                        error
                    );


                    if (
                        error instanceof Error
                    ) {

                        setError(
                            error.message
                        );

                    } else {

                        setError(
                            'Não foi possível carregar a pasta.'
                        );

                    }


                } finally {

                    console.log(
                        '[FolderPage] FINALIZOU'
                    );


                    setLoading(
                        false
                    );

                }

            }


            loadFolder();

        },
        [
            folderId
        ]
    );

    function handleOpenFolder(
        folder: Folder
    ) {

        navigate(
            `/library/folders/${folder.id}`
        );

    }

    function handleOpenVideo(
        videoId: string
    ) {

        navigate(
            `/watch/${videoId}`
        );
    }


    function handleBack() {

        if (
            data?.folder
                .parentFolderId
        ) {

            navigate(
                `/library/folders/${data.folder.parentFolderId}`
            );

            return;

        }


        navigate(
            '/library'
        );
    }

    if (!folderId) {

        return (
            <main
                className="folder-page"
            >

                <div
                    className="library-error"
                >

                    <strong>
                        Pasta inválida.
                    </strong>

                    <p>
                        ID da pasta não informado.
                    </p>

                </div>

            </main>
        );
    }
    if (!folderId) {

        return (
            <main
                className="folder-page"
            >

                <div
                    className="library-error"
                >

                    <strong>
                        Pasta inválida.
                    </strong>

                    <p>
                        ID da pasta não informado.
                    </p>

                </div>

            </main>
        );
    }


    if (loading) {

        return (

            <main
                className="folder-page"
            >

                <div
                    className="library-message"
                >

                    <div
                        className="loading-spinner"
                    />

                    <p>
                        Carregando pasta...
                    </p>

                </div>

            </main>

        );
    }


    if (error) {

        return (

            <main
                className="folder-page"
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
                        Não foi possível carregar a pasta.
                    </strong>

                    <p>
                        {error}
                    </p>

                </div>

            </main>

        );
    }


    if (!data) {

        return null;

    }


    const hasFolders =
        data.folders.length > 0;


    const hasVideos =
        data.videos.length > 0;


    return (

        <main
            className="folder-page"
        >

            <button
                type="button"
                className="back-button"
                onClick={
                    handleBack
                }
            >

                ← Voltar

            </button>


            <header
                className="folder-page-header"
            >

                <div
                    className="folder-page-icon"
                >
                    📁
                </div>


                <div>

                    <h1>
                        {
                            data.folder.name
                        }
                    </h1>

                    <p>

                        {
                            data.folders.length
                        }

                        {
                            data.folders.length === 1
                                ? ' subpasta'
                                : ' subpastas'
                        }

                        {' • '}

                        {
                            data.videos.length
                        }

                        {
                            data.videos.length === 1
                                ? ' vídeo'
                                : ' vídeos'
                        }

                    </p>

                </div>

            </header>


            {
                hasFolders && (

                    <section
                        className="folder-section"
                    >

                        <h2>
                            Pastas
                        </h2>


                        <div
                            className="folder-grid"
                        >

                            {
                                data.folders.map(
                                    folder => (

                                        <FolderCard
                                            key={
                                                folder.id
                                            }
                                            folder={
                                                folder
                                            }
                                            onOpen={
                                                handleOpenFolder
                                            }
                                        />

                                    )
                                )
                            }

                        </div>

                    </section>

                )
            }


            {
                hasVideos && (

                    <section
                        className="folder-section"
                    >

                        <h2>
                            Vídeos
                        </h2>


                        <div
                            className="video-list"
                        >

                            {
                                data.videos.map(
                                    video => (

                                        <VideoItem
                                            key={
                                                video.id
                                            }
                                            video={
                                                video
                                            }
                                            onOpen={
                                                video =>
                                                    handleOpenVideo(
                                                        video.id
                                                    )
                                            }
                                        />

                                    )
                                )
                            }

                        </div>

                    </section>

                )
            }


            {
                !hasFolders &&
                !hasVideos && (

                    <div
                        className="library-empty"
                    >

                        <div
                            className="empty-icon"
                        >
                            📂
                        </div>


                        <h3>
                            Pasta vazia
                        </h3>


                        <p>
                            Essa pasta não contém subpastas ou vídeos.
                        </p>

                    </div>

                )
            }

        </main>

    );
}