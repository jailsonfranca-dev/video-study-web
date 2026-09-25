import type {
    Folder
} from '../types/library';


interface FolderCardProps {

    folder:
        Folder;

    onOpen:
        (folder: Folder) =>
            void;
}


export function FolderCard({
                               folder,
                               onOpen
                           }: FolderCardProps) {

    return (

        <button
            type="button"
            className="folder-card"
            onClick={
                () =>
                    onOpen(
                        folder
                    )
            }
        >

            <div
                className="folder-icon"
                aria-hidden="true"
            >
                📁
            </div>


            <div
                className="folder-info"
            >

                <h3>
                    {folder.name}
                </h3>


                {
                    (
                        folder.folderCount > 0 ||
                        folder.videoCount > 0
                    ) && (

                        <p>

                            {
                                folder.folderCount
                            }

                            {
                                folder.folderCount === 1
                                    ? ' pasta'
                                    : ' pastas'
                            }

                            {' • '}

                            {
                                folder.videoCount
                            }

                            {
                                folder.videoCount === 1
                                    ? ' vídeo'
                                    : ' vídeos'
                            }

                        </p>

                    )
                }

            </div>


            <div
                className="folder-arrow"
                aria-hidden="true"
            >
                ›
            </div>

        </button>

    );
}