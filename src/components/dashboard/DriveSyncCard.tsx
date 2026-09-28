interface DriveSyncCardProps {

    syncing:
        boolean;

    message:
        string | null;

    onSync:
        () => void;

}


export function DriveSyncCard({

                                  syncing,

                                  message,

                                  onSync

                              }: DriveSyncCardProps) {

    return (

        <section className="drive-sync-card">

            <div>

                <h2>
                    Biblioteca do Google Drive
                </h2>


                <p>
                    Procure novas pastas e novos vídeos
                    adicionados ao Drive.
                </p>

            </div>


            <button
                type="button"
                onClick={
                    onSync
                }
                disabled={
                    syncing
                }
            >

                {
                    syncing
                        ? '⟳ Sincronizando...'
                        : '↻ Recarregar pastas'
                }

            </button>


            {
                message && (

                    <p className="sync-message">

                        {message}

                    </p>

                )
            }

        </section>

    );

}