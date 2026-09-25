export function naturalSort(
    a: string,
    b: string
): number {

    return a.localeCompare(
        b,
        'pt-BR',
        {
            numeric: true,
            sensitivity: 'base'
        }
    );
}