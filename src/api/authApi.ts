import {
    apiFetch
} from './http';

import {
    saveAccessToken
} from '../auth/authSession';


/*
 * =========================================
 * USER
 * =========================================
 */

export interface User {

    id:
        string;

    name?:
        string;

    email:
        string;

}


/*
 * =========================================
 * LOGIN
 * =========================================
 */

export interface LoginRequest {

    email:
        string;

    password:
        string;

}


export interface LoginResponse {

    user:
        User;

    token:
        string;

}


/*
 * =========================================
 * GET ME RESPONSE
 * =========================================
 *
 * Aceitamos os dois formatos:
 *
 * { user: {...} }
 *
 * ou diretamente:
 *
 * { id, name, email }
 */

type MeResponse =
    | User
    | {
    user:
        User;
};


/*
 * =========================================
 * LOGIN
 * =========================================
 */

export async function login(

    credentials:
        LoginRequest

): Promise<LoginResponse> {

    const response =
        await apiFetch<LoginResponse>(
            '/auth/login',
            {

                method:
                    'POST',

                /*
                 * Ainda não existe token.
                 */
                auth:
                    false,

                /*
                 * Um 401 no login pode ser
                 * simplesmente senha incorreta.
                 *
                 * Não queremos reload da página.
                 */
                redirectOnUnauthorized:
                    false,

                body:
                    JSON.stringify(
                        credentials
                    )

            }
        );


    if (
        !response
    ) {

        throw new Error(
            'O servidor não retornou os dados do login.'
        );

    }


    if (
        !response.token
    ) {

        throw new Error(
            'O servidor não retornou o token de autenticação.'
        );

    }


    if (
        !response.user
    ) {

        throw new Error(
            'O servidor não retornou os dados do usuário.'
        );

    }


    /*
     * Salva JWT.
     */
    saveAccessToken(
        response.token
    );


    return response;

}


/*
 * =========================================
 * GET ME
 * =========================================
 */

export async function getMe():
    Promise<User> {

    const response =
        await apiFetch<MeResponse>(
            '/auth/me'
        );


    /*
     * Backend:
     *
     * {
     *   user: {...}
     * }
     */

    if (
        response &&
        typeof response ===
        'object' &&
        'user' in response
    ) {

        return response.user;

    }


    /*
     * Backend:
     *
     * {
     *   id,
     *   email,
     *   name
     * }
     */

    return response;

}


/*
 * =========================================
 * CRIAR MEDIA SESSION
 * =========================================
 */

export async function createMediaSession() {

    await apiFetch<void>(
        '/auth/media-session',
        {

            method:
                'POST'

        }
    );

}


/*
 * =========================================
 * REMOVER MEDIA SESSION
 * =========================================
 */

export async function removeMediaSession() {

    await apiFetch<void>(
        '/media-session',
        {

            method:
                'DELETE',

            /*
             * Durante logout um token já
             * expirado não deve provocar
             * novo redirect.
             */
            redirectOnUnauthorized:
                false

        }
    );

}