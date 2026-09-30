import {
    createContext,
    useEffect,
    useState,
    type ReactNode
} from 'react';

import {
    clearAccessToken,
    getAccessToken
} from '../auth/authSession';

import {
    createMediaSession,
    getMe,
    login as loginRequest,
    removeMediaSession
} from '../api/authApi';

import type {
    User
} from '../api/authApi';


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

    children:
        ReactNode;

}


export function AuthProvider({

                                 children

                             }: AuthProviderProps) {

    /*
     * =========================================
     * TOKEN
     * =========================================
     */

    const [
        token,
        setToken
    ] =
        useState<string | null>(
            null
        );


    /*
     * =========================================
     * USER
     * =========================================
     */

    const [
        user,
        setUser
    ] =
        useState<User | null>(
            null
        );


    /*
     * =========================================
     * RESTAURANDO SESSÃO
     * =========================================
     */

    const [
        restoring,
        setRestoring
    ] =
        useState(
            true
        );


    /*
     * =========================================
     * RESTAURAR SESSÃO AO ABRIR O APP
     * =========================================
     */

    useEffect(
        () => {

            let active =
                true;


            async function restoreSession() {

                const storedToken =
                    getAccessToken();


                /*
                 * Não existe JWT salvo.
                 */
                if (
                    !storedToken
                ) {

                    if (
                        active
                    ) {

                        setToken(
                            null
                        );

                        setUser(
                            null
                        );

                        setRestoring(
                            false
                        );

                    }


                    return;

                }


                try {

                    /*
                     * =================================
                     * VALIDAR TOKEN
                     * =================================
                     *
                     * getMe() usa apiFetch().
                     *
                     * Portanto:
                     *
                     * /auth/me
                     *
                     * vira:
                     *
                     * /api/auth/me
                     */

                    const restoredUser =
                        await getMe();


                    if (
                        !active
                    ) {

                        return;

                    }


                    setToken(
                        storedToken
                    );


                    setUser(
                        restoredUser
                    );


                    /*
                     * =================================
                     * RECRIAR COOKIE DE MÍDIA
                     * =================================
                     */

                    await createMediaSession();


                } catch (
                    error
                    ) {

                    /*
                     * A chamada pode ter recebido 401.
                     *
                     * apiFetch() já limpa o token
                     * automaticamente.
                     */

                    clearAccessToken();


                    if (
                        active
                    ) {

                        setToken(
                            null
                        );

                        setUser(
                            null
                        );

                    }


                    /*
                     * Não precisamos jogar o erro
                     * novamente.
                     *
                     * Uma sessão expirada simplesmente
                     * significa que o usuário deverá
                     * fazer login novamente.
                     */

                    console.warn(
                        'Não foi possível restaurar a sessão.',
                        error
                    );

                } finally {

                    if (
                        active
                    ) {

                        setRestoring(
                            false
                        );

                    }

                }

            }


            void restoreSession();


            return () => {

                active =
                    false;

            };

        },
        []
    );


    /*
     * =========================================
     * LOGIN
     * =========================================
     */

    async function login(

        email:
            string,

        password:
            string

    ) {

        /*
         * loginRequest() usa:
         *
         * apiFetch('/auth/login')
         *
         * que vira:
         *
         * /api/auth/login
         *
         * O próprio authApi salva o JWT
         * em sessionStorage.
         */

        const response =
            await loginRequest({

                email,

                password

            });


        /*
         * Atualiza imediatamente
         * o estado do React.
         */

        setToken(
            response.token
        );


        setUser(
            response.user
        );


        /*
         * =====================================
         * COOKIE HTTPONLY DO STREAM
         * =====================================
         *
         * O token já foi salvo pelo login,
         * portanto createMediaSession()
         * consegue enviar Authorization.
         */

        await createMediaSession();

    }


    /*
     * =========================================
     * LOGOUT
     * =========================================
     */

    async function logout() {

        try {

            /*
             * Remove primeiro o cookie
             * HttpOnly usado pelo player.
             */
            await removeMediaSession();


        } catch (
            error
            ) {

            /*
             * Logout local deve acontecer
             * mesmo se o backend estiver
             * indisponível ou o token
             * já estiver expirado.
             */

            console.warn(
                'Não foi possível remover a sessão de mídia.',
                error
            );

        } finally {

            /*
             * =================================
             * LIMPAR SESSÃO LOCAL
             * =================================
             */

            clearAccessToken();


            setToken(
                null
            );


            setUser(
                null
            );

        }

    }


    /*
     * =========================================
     * PROVIDER
     * =========================================
     */

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