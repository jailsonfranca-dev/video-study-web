import {
    getAccessToken
} from '../auth/tokenStorage';


interface ApiErrorResponse {
    error?: string;
    message?: string;
}


export async function apiFetch<T>(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<T> {

    console.log(
        'ENTROU apiFetch',
        input
    );

    const token =
        getAccessToken();


    const headers =
        new Headers(
            init.headers
        );


    /*
     * JWT da API.
     */
    if (token) {

        headers.set(
            'Authorization',
            `Bearer ${token}`
        );

    }


    /*
     * Se existe body e o Content-Type
     * ainda não foi definido,
     * assumimos JSON.
     */
    if (
        init.body &&
        !headers.has(
            'Content-Type'
        )
    ) {

        headers.set(
            'Content-Type',
            'application/json'
        );

    }


    const response =
        await fetch(
            input,
            {
                ...init,

                headers
            }
        );


    /*
     * 204 = sucesso sem conteúdo.
     */
    if (
        response.status === 204
    ) {

        return undefined as T;

    }


    /*
     * Tentamos interpretar a resposta.
     */
    let data:
        T | ApiErrorResponse | null =
        null;


    const contentType =
        response.headers.get(
            'content-type'
        );


    if (
        contentType?.includes(
            'application/json'
        )
    ) {

        data =
            await response.json();

    }


    /*
     * Erros HTTP.
     */
    if (!response.ok) {

        const errorData =
            data as ApiErrorResponse | null;


        throw new Error(
            errorData?.error ??
            errorData?.message ??
            `Erro HTTP ${response.status}`
        );

    }


    return data as T;
}