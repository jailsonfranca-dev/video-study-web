import {
    Outlet
} from 'react-router-dom';

import {
    AppHeader
} from '../AppHeader.tsx';


export function AppLayout() {

    return (
        <>
            <AppHeader />

            <Outlet />
        </>
    );
}