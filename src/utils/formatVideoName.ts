export function formatVideoName(
    fileName: string
): string {

    const withoutExtension =
        fileName.replace(
            /\.[^.]+$/,
            ''
        );


    /*
     * captured-media-0-mp4
     *           ↓
     * Aula 01
     */
    const capturedMatch =
        withoutExtension.match(
            /^captured-media-(\d+)(?:-mp4)?$/i
        );


    if (capturedMatch) {

        const number =
            Number(
                capturedMatch[1]
            ) + 1;


        return `Aula ${String(number)
            .padStart(2, '0')}`;
    }


    /*
     * Remove um possível "-mp4"
     * deixado no nome original.
     */
    const cleaned =
        withoutExtension
            .replace(
                /-mp4$/i,
                ''
            )
            .replace(
                /[_-]+/g,
                ' '
            )
            .replace(
                /\s+/g,
                ' '
            )
            .trim();


    if (!cleaned) {
        return 'Vídeo';
    }


    return (
        cleaned.charAt(0).toUpperCase() +
        cleaned.slice(1)
    );
}