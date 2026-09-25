import {
    useEffect,
    useState
} from 'react';

import {
    useNavigate
} from 'react-router-dom';

import {
    getRootFolders
} from '../api/libraryApi';

import {
    FolderCard
} from '../components/FolderCard';



import type {
    Folder
} from '../types/library';


export function LibraryPage() {

    const navigate =
        useNavigate();





    const [
        folders,
        setFolders
    ] = useState<Folder[]>([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState('');




    function handleOpenFolder(
        folder: Folder
    ) {

        navigate(
            `/library/folders/${folder.id}`
        );
    }


    useEffect(
        () => {

            const controller =
                new AbortController();


            async function loadLibrary() {

                try {

                    setLoading(true);

                    setError('');


                    const result =
                        await getRootFolders(
                            controller.signal
                        );


                    setFolders(
                        result
                    );


                } catch (error) {

                    /*
                     * AbortController é usado
                     * quando o componente
                     * deixa de existir.
                     */
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
                            'Não foi possível carregar a biblioteca.'
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


            loadLibrary();


            return () => {

                controller.abort();

            };

        },
        []
    );


    return (

        <main
            className="library-page"
        >




            <section
                className="library-content"
            >

                <div
                    className="library-title"
                >

                    <div>

                        <h2>
                            Minha Biblioteca
                        </h2>

                        <p>
                            Selecione uma pasta para estudar.
                        </p>

                    </div>


                    {
                        !loading &&
                        !error && (

                            <span
                                className="folder-total"
                            >

                                {
                                    folders.length
                                }

                                {
                                    folders.length === 1
                                        ? ' pasta'
                                        : ' pastas'
                                }

                            </span>

                        )
                    }

                </div>


                {
                    loading && (

                        <div
                            className="library-message"
                        >

                            <div
                                className="loading-spinner"
                            />

                            <p>
                                Carregando biblioteca...
                            </p>

                        </div>

                    )
                }


                {
                    error && (

                        <div
                            className="library-error"
                        >

                            <strong>
                                Não foi possível carregar a biblioteca.
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    )
                }


                {
                    !loading &&
                    !error &&
                    folders.length === 0 && (

                        <div
                            className="library-empty"
                        >

                            <div
                                className="empty-icon"
                            >
                                📂
                            </div>

                            <h3>
                                Biblioteca vazia
                            </h3>

                            <p>
                                Nenhuma pasta foi sincronizada ainda.
                            </p>

                        </div>

                    )
                }


                {
                    !loading &&
                    !error &&
                    folders.length > 0 && (

                        <div
                            className="folder-grid"
                        >

                            {
                                folders.map(
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

                    )
                }

            </section>

        </main>

    );
}
