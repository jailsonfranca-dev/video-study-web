import {
    createContext
} from 'react';

import type {
    User
} from '../api/authApi';


export interface AuthContextValue {

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