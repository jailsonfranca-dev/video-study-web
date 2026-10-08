interface DriveSyncCardProps {

    syncing:
        boolean;

    message:
        string | null;

    error:
        string | null;

    onSync:
        () => Promise<void> | void;

}


export function DriveSyncCard({

                                  syncing,

                                  message,

                                  error,

                                  onSync

                              }: DriveSyncCardProps) {

    return (

        <section

            className="drive-sync-card"

            aria-busy={
                syncing
            }

        >

            {/*
             * =================================
             * INFORMAÇÕES
             * =================================
             */}

            <div
                className="drive-sync-content"
            >

                <div
                    className="drive-sync-heading"
                >

                    <div

                        className="drive-sync-icon"

                        aria-hidden="true"

                    >
                        ☁
                    </div>


                    <div>

                        <h2>
                            Google Drive
                        </h2>


                        <p>
                            Sincronize sua biblioteca
                            de vídeos com o Google Drive.
                        </p>

                    </div>

                </div>


                {/*
                 * =================================
                 * FEEDBACK
                 * =================================
                 */}

                <div

                    className="drive-sync-feedback"

                    aria-live="polite"

                >

                    {
                        syncing && (

                            <p
                                className="
                                    sync-message
                                    sync-message-loading
                                "
                            >

                                Sincronizando sua biblioteca...

                            </p>

                        )
                    }


                    {
                        !syncing &&
                        message && (

                            <p
                                className="
                                    sync-message
                                    sync-message-success
                                "
                                role="status"
                            >

                                <span
                                    aria-hidden="true"
                                >
                                    ✓
                                </span>

                                {message}

                            </p>

                        )
                    }


                    {
                        !syncing &&
                        error && (

                            <p
                                className="
                                    sync-message
                                    sync-message-error
                                "
                                role="alert"
                            >

                                <span
                                    aria-hidden="true"
                                >
                                    ⚠
                                </span>

                                {error}

                            </p>

                        )
                    }

                </div>

            </div>


            {/*
             * =================================
             * BOTÃO
             * =================================
             */}

            <button

                type="button"

                onClick={
                    onSync
                }

                disabled={
                    syncing
                }

                aria-busy={
                    syncing
                }

            >

                <span
                    className="async-button-content"
                >

                    {
                        syncing && (

                            <span

                                className="button-spinner"

                                aria-hidden="true"

                            />

                        )
                    }


                    <span>

                        {
                            syncing

                                ? 'Sincronizando...'

                                : 'Sincronizar agora'
                        }

                    </span>

                </span>

            </button>

        </section>

    );

}