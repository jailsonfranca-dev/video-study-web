import {
    getAccessToken
} from '../auth/tokenStorage';


export async function apiFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {

    const token =
        getAccessToken();


    const headers =
        new Headers(
            init.headers
        );


    if (token) {

        headers.set(
            'Authorization',
            `Bearer ${token}`
        );

    }


    return fetch(
        input,
        {
            ...init,
            headers
        }
    );
}