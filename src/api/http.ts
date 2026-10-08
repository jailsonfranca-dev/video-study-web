import {
    clearAccessToken,
    getAccessToken
} from '../auth/authSession';


/*
 * =========================================
 * API BASE URL
 * =========================================
 *
 * DESENVOLVIMENTO:
 *
 * VITE_API_URL não existe
 *      ↓
 * /api
 *      ↓
 * proxy do Vite
 *      ↓
 * http://localhost:3000
 *
 *
 * PRODUÇÃO:
 *
 * VITE_API_URL=
 * https://video-study-api.onrender.com
 *
 *      ↓
 *
 * https://video-study-api.onrender.com
 */

const environmentApiUrl =
    import.meta.env
        .VITE_API_URL
        ?.trim()
        .replace(
            /\/+$/,
            ''
        );


const API_PREFIX =
    environmentApiUrl ||
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
 * NORMALIZAR PATH
 * =========================================
 */

function normalizeApiPath(
    path:
        string
) {

    /*
     * Aceita tanto:
     *
     * /library
     *
     * quanto:
     *
     * /api/library
     *
     * e evita gerar:
     *
     * /api/api/library
     */

    const withoutApiPrefix =
        path.replace(
            /^\/api(?=\/|$)/,
            ''
        );


    if (
        withoutApiPrefix.startsWith(
            '/'
        )
    ) {

        return withoutApiPrefix;

    }


    return (
        `/${withoutApiPrefix}`
    );

}


/*
 * =========================================
 * MONTAR URL
 * =========================================
 */

function buildApiUrl(
    path:
        string
) {

    const normalizedPath =
        normalizeApiPath(
            path
        );


    return (
        `${API_PREFIX}${normalizedPath}`
    );

}


/*
 * =========================================
 * LER CORPO DA RESPOSTA
 * =========================================
 */

async function readResponseBody<T>(
    response:
        Response
): Promise<T | string | undefined> {

    const text =
        await response.text();


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

            throw new Error(
                'O servidor retornou uma resposta JSON inválida.'
            );

        }

    }


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
     * Content-Type somente quando
     * existe body e não é FormData.
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
     * URL
     * =====================================
     */

    const url =
        buildApiUrl(
            path
        );


    /*
     * =====================================
     * REQUEST
     * =====================================
     */

    const response =
        await fetch(

            url,

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