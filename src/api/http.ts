import {
    clearAccessToken,
    getAccessToken
} from '../auth/authSession';


const API_PREFIX =
    '/api';


let redirectingToLogin =
    false;


/*
 * =========================================
 * OPTIONS
 * =========================================
 */

interface ApiFetchOptions
    extends RequestInit {

    auth?:
        boolean;

    redirectOnUnauthorized?:
        boolean;

}


/*
 * =========================================
 * ERRO DA API
 * =========================================
 */

interface ApiErrorResponse {

    error?:
        string;

    message?:
        string;

}


/*
 * =========================================
 * REDIRECIONAR PARA LOGIN
 * =========================================
 */

function handleUnauthorized() {

    clearAccessToken();


    if (
        redirectingToLogin
    ) {

        return;

    }


    if (
        window.location.pathname ===
        '/login'
    ) {

        return;

    }


    redirectingToLogin =
        true;


    window.location.replace(
        '/login'
    );

}


/*
 * =========================================
 * LER CORPO DA RESPOSTA COM SEGURANÇA
 * =========================================
 *
 * Não usamos response.json() diretamente.
 *
 * Primeiro lemos como texto.
 *
 * Isso evita:
 *
 * Unexpected end of JSON input
 *
 * quando o backend retorna corpo vazio.
 */

async function readResponseBody<T>(
    response:
        Response
): Promise<T | string | undefined> {

    const text =
        await response.text();


    /*
     * Corpo vazio.
     */
    if (
        !text.trim()
    ) {

        return undefined;

    }


    const contentType =
        response
            .headers
            .get(
                'content-type'
            );


    /*
     * JSON
     */
    if (
        contentType
            ?.includes(
                'application/json'
            )
    ) {

        try {

            return JSON.parse(
                text
            ) as T;


        } catch {

            /*
             * O servidor disse que era JSON,
             * mas retornou conteúdo inválido.
             */

            throw new Error(
                'O servidor retornou uma resposta JSON inválida.'
            );

        }

    }


    /*
     * Texto normal.
     */
    return text;

}


/*
 * =========================================
 * EXTRAIR MENSAGEM DE ERRO
 * =========================================
 */

function getErrorMessage(

    body:
        unknown,

    status:
        number

) {

    if (
        typeof body ===
        'string' &&
        body.trim()
    ) {

        return body;

    }


    if (
        body &&
        typeof body ===
        'object'
    ) {

        const apiError =
            body as
                ApiErrorResponse;


        if (
            apiError.error
        ) {

            return apiError.error;

        }


        if (
            apiError.message
        ) {

            return apiError.message;

        }

    }


    if (
        status ===
        401
    ) {

        return (
            'Sua sessão expirou. Faça login novamente.'
        );

    }


    if (
        status ===
        403
    ) {

        return (
            'Você não tem permissão para realizar esta operação.'
        );

    }


    if (
        status ===
        404
    ) {

        return (
            'Recurso não encontrado.'
        );

    }


    if (
        status >=
        500
    ) {

        return (
            'Erro interno do servidor.'
        );

    }


    return (
        `Erro HTTP ${status}`
    );

}


/*
 * =========================================
 * API FETCH
 * =========================================
 */

export async function apiFetch<T>(

    path:
        string,

    options:
        ApiFetchOptions =
        {}

): Promise<T> {

    const {

        auth =
            true,

        redirectOnUnauthorized =
            true,

        headers,

        ...fetchOptions

    } =
        options;


    /*
     * =====================================
     * TOKEN
     * =====================================
     */

    const token =
        getAccessToken();


    /*
     * =====================================
     * HEADERS
     * =====================================
     */

    const requestHeaders =
        new Headers(
            headers
        );


    /*
     * Só adicionamos Content-Type JSON
     * quando existe body e ele não é FormData.
     */
    if (
        fetchOptions.body &&
        !(
            fetchOptions.body
            instanceof FormData
        ) &&
        !requestHeaders.has(
            'Content-Type'
        )
    ) {

        requestHeaders.set(
            'Content-Type',
            'application/json'
        );

    }


    /*
     * =====================================
     * AUTHORIZATION
     * =====================================
     */

    if (
        auth &&
        token
    ) {

        requestHeaders.set(
            'Authorization',
            `Bearer ${token}`
        );

    }


    /*
     * =====================================
     * REQUEST
     * =====================================
     */

    const response =
        await fetch(

            `${API_PREFIX}${path}`,

            {

                ...fetchOptions,

                headers:
                requestHeaders,

                credentials:
                    'include'

            }

        );


    /*
     * =====================================
     * LER RESPOSTA
     * =====================================
     */

    const body =
        response.status ===
        204

            ? undefined

            : await readResponseBody<T>(
                response
            );


    /*
     * =====================================
     * 401
     * =====================================
     */

    if (
        response.status ===
        401
    ) {

        const message =
            getErrorMessage(
                body,
                response.status
            );


        if (
            redirectOnUnauthorized
        ) {

            handleUnauthorized();

        }


        throw new Error(
            message
        );

    }


    /*
     * =====================================
     * OUTROS ERROS
     * =====================================
     */

    if (
        !response.ok
    ) {

        throw new Error(

            getErrorMessage(
                body,
                response.status
            )

        );

    }


    /*
     * =====================================
     * 204
     * =====================================
     */

    if (
        response.status ===
        204
    ) {

        return undefined as T;

    }


    /*
     * =====================================
     * RESPOSTA VAZIA
     * =====================================
     */

    if (
        body ===
        undefined
    ) {

        return undefined as T;

    }


    return body as T;

}