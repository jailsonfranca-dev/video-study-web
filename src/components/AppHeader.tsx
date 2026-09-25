import {
    useNavigate
} from 'react-router-dom';

import {
    useAuth
} from '../hooks/useAuth';


export function AppHeader() {

    const navigate =
        useNavigate();

    const {
        user,
        logout
    } =
        useAuth();


    async function handleLogout() {

        await logout();

        navigate(
            '/login',
            {
                replace: true
            }
        );
    }


    return (
        <header
            className="app-header"
        >

            <button
                type="button"
                className="app-brand"
                onClick={
                    () =>
                        navigate('/library')
                }
            >

                <span
                    className="app-brand-icon"
                >
                    ▶
                </span>

                <span>
                    Video Study
                </span>

            </button>


            <div
                className="app-header-user"
            >

                {
                    user && (
                        <div
                            className="app-user-info"
                        >

                            <strong>
                                {
                                    user.name ??
                                    'Usuário'
                                }
                            </strong>

                            <span>
                                {user.email}
                            </span>

                        </div>
                    )
                }


                <button
                    type="button"
                    className="header-logout-button"
                    onClick={
                        handleLogout
                    }
                >
                    Sair
                </button>

            </div>

        </header>
    );
}