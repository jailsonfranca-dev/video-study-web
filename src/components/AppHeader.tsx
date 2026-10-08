import {
    NavLink,
    useNavigate
} from 'react-router-dom';

import {
    useState
} from 'react';


import {
    useAuth
} from '../hooks/useAuth';

import {
    ThemeToggle
} from './layouts/ThemeToggle';


export function AppHeader() {

    const navigate =
        useNavigate();


    const {
        user,
        logout
    } =
        useAuth();

    const [
        loggingOut,
        setLoggingOut
    ] =
        useState(
            false
        );


    async function handleLogout() {

        /*
         * Impede vários cliques
         * enquanto o logout está
         * sendo processado.
         */
        if (
            loggingOut
        ) {
            return;
        }


        try {

            setLoggingOut(
                true
            );


            /*
             * AuthProvider.logout():
             *
             * 1. remove Media Session;
             * 2. limpa JWT;
             * 3. limpa user.
             */
            await logout();


            /*
             * Após concluir,
             * volta para o Login.
             */
            navigate(
                '/login',
                {
                    replace: true
                }
            );


        } finally {

            /*
             * Normalmente o Header será
             * desmontado após o navigate.
             *
             * Mesmo assim mantemos este
             * finally para deixar o fluxo
             * completo.
             */
            setLoggingOut(
                false
            );

        }

    }


    return (

        <header className="app-header">

            <button
                type="button"
                className="app-brand"
                onClick={() => navigate('/dashboard')}
            >
        <span className="app-brand-icon">
            ▶
        </span>

                <span className="app-brand-text">
            Video Study
        </span>
            </button>


            <nav className="app-navigation">

                <NavLink
                    to="/dashboard"
                    className={({isActive}) =>
                        isActive
                            ? 'active'
                            : ''
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/library"
                    className={({isActive}) =>
                        isActive
                            ? 'active'
                            : ''
                    }
                >
                    Biblioteca
                </NavLink>

            </nav>


            <div className="app-header-user">

                <ThemeToggle/>

                <div className="app-user-info">

                    <strong>
                        {user?.name || 'Usuário'}
                    </strong>

                    <span>
                {user?.email}
            </span>

                </div>

                <button

                    type="button"

                    className="header-logout-button"

                    onClick={
                        handleLogout
                    }

                    disabled={
                        loggingOut
                    }

                    aria-busy={
                        loggingOut
                    }

                >

                    <span
                        className="async-button-content"
                    >

                        {
                            loggingOut && (

                                <span

                                    className="
                                        button-spinner
                                        button-spinner-secondary
                                    "

                                    aria-hidden="true"

                                />

                            )
                        }


                        <span>

                            {
                                loggingOut
                                    ? 'Saindo...'
                                    : 'Sair'
                            }

                        </span>

                    </span>
                </button>

            </div>

        </header>

    );

}