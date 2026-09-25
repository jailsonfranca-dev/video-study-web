import {
    createContext,
    useEffect,
    useState
} from 'react';

import type {
    ReactNode
} from 'react';

import {
    clearAccessToken,
    getAccessToken,
    saveAccessToken
} from '../auth/tokenStorage';


interface User {
    id: string;
    name?: string;
    email: string;
}


interface AuthContextValue {

    user:
        User | null;

    token:
        string | null;

    restoring:
        boolean;

    login:
        (
            email: string,
            password: string
        ) => Promise<void>;

    logout:
        () => Promise<void>;
}


export const AuthContext =
    createContext<
        AuthContextValue | undefined
    >(
        undefined
    );


interface AuthProviderProps {
    children: ReactNode;
}


export function AuthProvider({
                                 children
                             }: AuthProviderProps) {

    const [
        token,
        setToken
    ] =
        useState<string | null>(
            null
        );


    const [
        user,
        setUser
    ] =
        useState<User | null>(
            null
        );


    const [
        restoring,
        setRestoring
    ] =
        useState(
            true
        );


    /*
     * Executado uma vez quando
     * o React inicializa.
     */
    useEffect(
        () => {

            const controller =
                new AbortController();


            async function restoreSession() {

                const storedToken =
                    getAccessToken();


                if (!storedToken) {

                    setRestoring(
                        false
                    );

                    return;
                }


                try {

                    const response =
                        await fetch(
                            '/auth/me',
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${storedToken}`
                                },

                                signal:
                                controller.signal
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            'Sessão expirada.'
                        );

                    }


                    const data =
                        await response.json();


                    const restoredUser =
                        data.user ??
                        data;


                    setToken(
                        storedToken
                    );


                    setUser(
                        restoredUser
                    );


                    /*
                     * Renova/recria também
                     * o cookie HttpOnly usado
                     * pelo <video>.
                     */
                    const mediaResponse =
                        await fetch(
                            '/auth/media-session',
                            {
                                method:
                                    'POST',

                                headers: {
                                    Authorization:
                                        `Bearer ${storedToken}`
                                },

                                signal:
                                controller.signal
                            }
                        );


                    if (!mediaResponse.ok) {

                        throw new Error(
                            'Não foi possível restaurar a sessão de mídia.'
                        );

                    }


                } catch (error) {

                    if (
                        error instanceof DOMException &&
                        error.name ===
                        'AbortError'
                    ) {

                        return;
                    }


                    clearAccessToken();

                    setToken(
                        null
                    );

                    setUser(
                        null
                    );


                } finally {

                    if (
                        !controller.signal.aborted
                    ) {

                        setRestoring(
                            false
                        );

                    }

                }
            }


            restoreSession();


            return () => {

                controller.abort();

            };

        },
        []
    );


    async function login(
        email: string,
        password: string
    ) {

        const response =
            await fetch(
                '/auth/login',
                {
                    method:
                        'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify({
                            email,
                            password
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ??
                'Não foi possível entrar.'
            );

        }


        const accessToken =
            data.token;


        saveAccessToken(
            accessToken
        );


        setToken(
            accessToken
        );


        setUser(
            data.user
        );


        /*
         * Cookie HttpOnly
         * usado pelo stream.
         */
        await fetch(
            '/auth/media-session',
            {
                method:
                    'POST',

                headers: {
                    Authorization:
                        `Bearer ${accessToken}`
                }
            }
        );
    }


    async function logout() {

        const currentToken =
            token ??
            getAccessToken();


        if (currentToken) {

            try {

                await fetch(
                    '/auth/media-session',
                    {
                        method:
                            'DELETE',

                        headers: {
                            Authorization:
                                `Bearer ${currentToken}`
                        }
                    }
                );

            } catch {

                /*
                 * Mesmo que o backend
                 * esteja indisponível,
                 * removemos a sessão local.
                 */

            }

        }


        clearAccessToken();

        setToken(
            null
        );

        setUser(
            null
        );
    }


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                restoring,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}