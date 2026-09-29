export function formatStudyTime(
    totalSeconds: number
) {

    const seconds =
        Math.max(
            Math.floor(
                totalSeconds
            ),
            0
        );


    if (
        seconds < 60
    ) {

        return `${seconds}s`;

    }


    const totalMinutes =
        Math.floor(
            seconds / 60
        );


    if (
        totalMinutes < 60
    ) {

        return `${totalMinutes}min`;

    }


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    if (
        minutes === 0
    ) {

        return `${hours}h`;

    }


    return `${hours}h ${minutes}min`;

}