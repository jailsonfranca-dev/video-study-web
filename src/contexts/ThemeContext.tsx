import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode
} from 'react';


export type Theme =
    | 'light'
    | 'dark';


interface ThemeContextValue {

    theme: Theme;

    setTheme: (
        theme: Theme
    ) => void;

    toggleTheme: () => void;

}


export const ThemeContext =
    createContext<
        ThemeContextValue | undefined
    >(
        undefined
    );


interface ThemeProviderProps {

    children:
        ReactNode;

}


const STORAGE_KEY =
    'video-study:theme';


function getSystemTheme(): Theme {

    if (
        typeof window ===
        'undefined'
    ) {

        return 'light';

    }


    return window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches
        ? 'dark'
        : 'light';

}


function getInitialTheme(): Theme {

    if (
        typeof window ===
        'undefined'
    ) {

        return 'light';

    }


    const storedTheme =
        window.localStorage.getItem(
            STORAGE_KEY
        );


    if (
        storedTheme === 'light' ||
        storedTheme === 'dark'
    ) {

        return storedTheme;

    }


    return getSystemTheme();

}


export function ThemeProvider({

                                  children

                              }: ThemeProviderProps) {

    const [
        theme,
        setThemeState
    ] =
        useState<Theme>(
            getInitialTheme
        );


    const setTheme =
        useCallback(
            (
                newTheme: Theme
            ) => {

                setThemeState(
                    newTheme
                );


                window
                    .localStorage
                    .setItem(
                        STORAGE_KEY,
                        newTheme
                    );

            },
            []
        );


    const toggleTheme =
        useCallback(
            () => {

                setThemeState(
                    currentTheme => {

                        const newTheme:
                            Theme =
                            currentTheme ===
                            'dark'
                                ? 'light'
                                : 'dark';


                        window
                            .localStorage
                            .setItem(
                                STORAGE_KEY,
                                newTheme
                            );


                        return newTheme;

                    }
                );

            },
            []
        );


    useEffect(
        () => {

            document
                .documentElement
                .setAttribute(
                    'data-theme',
                    theme
                );

        },
        [
            theme
        ]
    );


    const value =
        useMemo(
            () => ({

                theme,

                setTheme,

                toggleTheme

            }),
            [
                theme,
                setTheme,
                toggleTheme
            ]
        );


    return (

        <ThemeContext.Provider
            value={
                value
            }
        >

            {children}

        </ThemeContext.Provider>

    );

}