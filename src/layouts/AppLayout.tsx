import {
    Outlet
} from 'react-router-dom';

import {
    AppHeader
} from '../components/AppHeader';


export function AppLayout() {

    return (
        <>
            <AppHeader />

            <Outlet />
        </>
    );
}