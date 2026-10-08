import {
    useEffect,
    useState,
    type ReactNode
} from 'react';

import {
    AuthContext
} from './auth-context';

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
                     * getMe() utiliza apiFetch().
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
                     *
                     * O cookie HttpOnly é necessário
                     * para o stream do elemento <video>.
                     */

                    await createMediaSession();


                } catch (
                    error
                    ) {

                    /*
                     * Uma falha aqui normalmente significa
                     * que a sessão não é mais válida.
                     *
                     * apiFetch() também pode já ter removido
                     * o token ao receber HTTP 401.
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

    ): Promise<void> {

        /*
         * loginRequest() utiliza:
         *
         * apiFetch('/auth/login')
         *
         * que através do proxy vira:
         *
         * /api/auth/login
         *
         * authApi salva o JWT no sessionStorage.
         */

        const response =
            await loginRequest({

                email,

                password

            });


        /*
         * Atualiza imediatamente
         * o estado global da aplicação.
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
         * Como o JWT já foi salvo pelo login,
         * createMediaSession() consegue enviar
         * Authorization normalmente.
         */

        await createMediaSession();

    }


    /*
     * =========================================
     * LOGOUT
     * =========================================
     */

    async function logout():
        Promise<void> {

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
             * O logout local deve continuar
             * funcionando mesmo se:
             *
             * - backend estiver indisponível;
             * - JWT estiver expirado;
             * - cookie já tiver desaparecido.
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