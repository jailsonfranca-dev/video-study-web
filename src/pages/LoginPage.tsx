import {
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
        login
    } = useAuth();


    const [
        email,
        setEmail
    ] = useState('');


    const [
        password,
        setPassword
    ] = useState('');


    const [
        error,
        setError
    ] = useState('');


    const [
        loading,
        setLoading
    ] = useState(false);


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setError('');

        setLoading(true);


        try {

            await login(
                email,
                password
            );


            navigate(
                '/library'
            );


        } catch (error) {

            if (
                error instanceof Error
            ) {

                setError(
                    error.message
                );

            } else {

                setError(
                    'Erro inesperado.'
                );

            }


        } finally {

            setLoading(false);

        }
    }


    return (

        <main className="login-page">

            <section className="login-card">

                <div className="login-brand">

                    <span className="brand-icon">
                        ▶
                    </span>

                    <h1>
                        Video Study
                    </h1>

                    <p>
                        Sua biblioteca de estudos em vídeo
                    </p>

                </div>


                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="login-form"
                >

                    <div className="form-group">

                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={
                                event =>
                                    setEmail(
                                        event.target.value
                                    )
                            }
                            placeholder="seu@email.com"
                            required
                            autoComplete="email"
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="password">
                            Senha
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={
                                event =>
                                    setPassword(
                                        event.target.value
                                    )
                            }
                            placeholder="Sua senha"
                            required
                            autoComplete="current-password"
                        />

                    </div>


                    {
                        error && (

                            <div className="form-error">

                                {error}

                            </div>

                        )
                    }


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            loading
                        }
                    >

                        {
                            loading
                                ? 'Entrando...'
                                : 'Entrar'
                        }

                    </button>

                </form>

            </section>

        </main>
    );
}