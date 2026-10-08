import {
    useEffect,
    useState,
    type FormEvent
} from 'react';

import {
    useNavigate
} from 'react-router-dom';

import {
    useAuth
} from '../hooks/useAuth';


export function LoginPage() {

    const navigate =
        useNavigate();


    const {
        user,
        restoring,
        login
    } =
        useAuth();


    /*
     * =========================================
     * FORMULÁRIO
     * =========================================
     */

    const [
        email,
        setEmail
    ] =
        useState('');


    const [
        password,
        setPassword
    ] =
        useState('');


    /*
     * =========================================
     * ESTADOS DE UX
     * =========================================
     */

    const [
        submitting,
        setSubmitting
    ] =
        useState(
            false
        );


    const [
        error,
        setError
    ] =
        useState<string | null>(
            null
        );


    /*
     * =========================================
     * USUÁRIO JÁ AUTENTICADO
     * =========================================
     */

    useEffect(
        () => {

            if (
                !restoring &&
                user
            ) {

                navigate(
                    '/dashboard',
                    {
                        replace: true
                    }
                );

            }

        },
        [
            user,
            restoring,
            navigate
        ]
    );


    /*
     * =========================================
     * LOGIN
     * =========================================
     */

    async function handleSubmit(
        event:
            FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        /*
         * Proteção contra clique duplo.
         */

        if (
            submitting
        ) {

            return;

        }


        /*
         * Validação básica.
         */

        if (
            !email.trim() ||
            !password
        ) {

            setError(
                'Informe o e-mail e a senha.'
            );

            return;

        }


        try {

            /*
             * =================================
             * INICIAR FEEDBACK
             * =================================
             */

            setSubmitting(
                true
            );


            setError(
                null
            );


            /*
             * O AuthProvider:
             *
             * 1. realiza login;
             * 2. salva JWT;
             * 3. atualiza usuário;
             * 4. cria Media Session.
             */

            await login(
                email.trim(),
                password
            );


            /*
             * =================================
             * REDIRECIONAR
             * =================================
             */

            navigate(
                '/dashboard',
                {
                    replace: true
                }
            );


        } catch (
            error
            ) {

            setError(

                error instanceof Error

                    ? error.message

                    : 'Não foi possível entrar. Tente novamente.'

            );


        } finally {

            setSubmitting(
                false
            );

        }

    }


    /*
     * =========================================
     * RESTAURAÇÃO DA SESSÃO
     * =========================================
     */

    if (
        restoring
    ) {

        return (

            <main
                className="session-loading"
            >

                <div
                    className="loading-spinner"
                />

                <p>
                    Restaurando sessão...
                </p>

            </main>

        );

    }


    /*
     * =========================================
     * LOGIN
     * =========================================
     */

    return (

        <main
            className="login-page"
        >

            <section
                className="login-card"
            >

                {/*
                 * =================================
                 * MARCA
                 * =================================
                 */}

                <header
                    className="login-brand"
                >

                    <div
                        className="brand-icon"
                        aria-hidden="true"
                    >
                        ▶
                    </div>


                    <h1>
                        Video Study
                    </h1>


                    <p>
                        Sua biblioteca de estudos em vídeo
                    </p>

                </header>


                {/*
                 * =================================
                 * FORM
                 * =================================
                 */}

                <form
                    className="login-form"
                    onSubmit={
                        handleSubmit
                    }
                    aria-busy={
                        submitting
                    }
                >

                    <div
                        className="form-group"
                    >

                        <label
                            htmlFor="email"
                        >
                            E-mail
                        </label>


                        <input

                            id="email"

                            type="email"

                            value={
                                email
                            }

                            onChange={
                                event =>
                                    setEmail(
                                        event.target.value
                                    )
                            }

                            placeholder="seu@email.com"

                            autoComplete="email"

                            disabled={
                                submitting
                            }

                            required

                        />

                    </div>


                    <div
                        className="form-group"
                    >

                        <label
                            htmlFor="password"
                        >
                            Senha
                        </label>


                        <input

                            id="password"

                            type="password"

                            value={
                                password
                            }

                            onChange={
                                event =>
                                    setPassword(
                                        event.target.value
                                    )
                            }

                            placeholder="Sua senha"

                            autoComplete="current-password"

                            disabled={
                                submitting
                            }

                            required

                        />

                    </div>


                    {/*
                     * =================================
                     * ERRO
                     * =================================
                     */}

                    {
                        error && (

                            <div
                                className="form-error"
                                role="alert"
                            >

                                {error}

                            </div>

                        )
                    }


                    {/*
                     * =================================
                     * BOTÃO
                     * =================================
                     */}

                    <button

                        type="submit"

                        className="primary-button"

                        disabled={
                            submitting
                        }

                        aria-busy={
                            submitting
                        }

                    >

                        <span
                            className="async-button-content"
                        >

                            {
                                submitting && (

                                    <span
                                        className="button-spinner"
                                        aria-hidden="true"
                                    />

                                )
                            }


                            <span>

                                {
                                    submitting
                                        ? 'Entrando...'
                                        : 'Entrar'
                                }

                            </span>

                        </span>

                    </button>

                </form>

            </section>

        </main>

    );

}