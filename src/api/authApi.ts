import {
    apiFetch,
    setAccessToken
} from './http';


export interface User {
    id: string;
    name?: string;
    email: string;
}


export interface LoginRequest {
    email: string;
    password: string;
}


export interface LoginResponse {
    user: User;
    token: string;
}


export async function login(
    credentials: LoginRequest
): Promise<LoginResponse> {

    const response =
        await fetch(
            '/auth/login',
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body:
                    JSON.stringify(
                        credentials
                    )
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error ||
            data.message ||
            'Não foi possível realizar o login.'
        );

    }


    setAccessToken(
        data.token
    );


    return data;
}


export async function createMediaSession() {

    await apiFetch(
        '/auth/media-session',
        {
            method: 'POST'
        }
    );

}


export async function removeMediaSession() {

    await apiFetch(
        '/auth/media-session',
        {
            method: 'DELETE'
        }
    );

}


export async function getMe() {

    return apiFetch<User>(
        '/auth/me'
    );

}