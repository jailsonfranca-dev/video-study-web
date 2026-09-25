import {
    Navigate,
    Outlet
} from 'react-router-dom';

import {
    useAuth
} from '../hooks/useAuth';


export function ProtectedRoute() {

    const {
        user,
        restoring
    } =
        useAuth();


    if (restoring) {

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


    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    return <Outlet />;
}