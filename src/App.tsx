import {
    Navigate,
    Route,
    Routes
} from 'react-router-dom';

import {
    ProtectedRoute
} from './components/ProtectedRoute';

import {
    AppLayout
} from './layouts/AppLayout';

import {
    LoginPage
} from './pages/LoginPage';

import {
    LibraryPage
} from './pages/LibraryPage';

import {
    FolderPage
} from './pages/FolderPage';

import {
    WatchPage
} from './pages/WatchPage';

import {
    DashboardPage
} from './pages/DashboardPage';


export default function App() {

    return (
        <Routes>

            <Route
                path="/login"
                element={
                    <LoginPage />
                }
            />


            <Route
                element={
                    <ProtectedRoute />
                }
            >

                <Route
                    element={
                        <AppLayout />
                    }
                >

                    <Route
                        path="/dashboard"
                        element={
                            <DashboardPage />
                        }
                    />


                    <Route
                        path="/library"
                        element={
                            <LibraryPage />
                        }
                    />


                    <Route
                        path="/library/folders/:folderId"
                        element={
                            <FolderPage />
                        }
                    />


                    <Route
                        path="/watch/:videoId"
                        element={
                            <WatchPage />
                        }
                    />

                </Route>

            </Route>


            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>
    );
}