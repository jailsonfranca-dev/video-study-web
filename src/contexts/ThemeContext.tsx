import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode
} from 'react';

import {
    ThemeContext,
    type Theme
} from './theme-context';


interface ThemeProviderProps {

    children:
        ReactNode;

}


const STORAGE_KEY =
    'video-study:theme';


/*
 * =========================================
 * TEMA DO SISTEMA
 * =========================================
 */

function getSystemTheme(): Theme {

    if (
        typeof window ===
        'undefined'
    ) {

        return 'light';

    }


    return window
        .matchMedia(
            '(prefers-color-scheme: dark)'
        )
        .matches
        ? 'dark'
        : 'light';

}


/*
 * =========================================
 * TEMA INICIAL
 * =========================================
 */

function getInitialTheme(): Theme {

    if (
        typeof window ===
        'undefined'
    ) {

        return 'light';

    }


    const storedTheme =
        window
            .localStorage
            .getItem(
                STORAGE_KEY
            );


    /*
     * Se o usuário já escolheu
     * manualmente um tema,
     * respeitamos essa escolha.
     */
    if (
        storedTheme ===
        'light' ||
        storedTheme ===
        'dark'
    ) {

        return storedTheme;

    }


    /*
     * Caso contrário,
     * usamos o tema do sistema.
     */
    return getSystemTheme();

}


/*
 * =========================================
 * THEME PROVIDER
 * =========================================
 */

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


    /*
     * =====================================
     * ACOMPANHAR ALTERAÇÃO DO WINDOWS
     * =====================================
     *
     * Só fazemos isso quando o usuário
     * ainda NÃO escolheu light/dark
     * manualmente.
     */

    useEffect(
        () => {

            const mediaQuery =
                window
                    .matchMedia(
                        '(prefers-color-scheme: dark)'
                    );


            function handleSystemThemeChange(

                event:
                    MediaQueryListEvent

            ) {

                const storedTheme =
                    window
                        .localStorage
                        .getItem(
                            STORAGE_KEY
                        );


                /*
                 * Usuário escolheu manualmente.
                 *
                 * Portanto, não alteramos
                 * o tema com o Windows.
                 */
                if (
                    storedTheme ===
                    'light' ||
                    storedTheme ===
                    'dark'
                ) {

                    return;

                }


                setThemeState(

                    event.matches
                        ? 'dark'
                        : 'light'

                );

            }


            mediaQuery
                .addEventListener(
                    'change',
                    handleSystemThemeChange
                );


            return () => {

                mediaQuery
                    .removeEventListener(
                        'change',
                        handleSystemThemeChange
                    );

            };

        },
        []
    );


    /*
     * =====================================
     * DEFINIR TEMA MANUALMENTE
     * =====================================
     */

    const setTheme =
        useCallback(
            (
                newTheme:
                    Theme
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


    /*
     * =====================================
     * ALTERNAR LIGHT / DARK
     * =====================================
     */

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


    /*
     * =====================================
     * APLICAR TEMA NO HTML
     * =====================================
     *
     * Resultado:
     *
     * <html data-theme="dark">
     *
     * ou
     *
     * <html data-theme="light">
     */

    useEffect(
        () => {

            document
                .documentElement
                .setAttribute(
                    'data-theme',
                    theme
                );


            /*
             * Também informa ao navegador
             * qual esquema está ativo.
             *
             * Ajuda inputs, selects,
             * scrollbar e controles nativos.
             */
            document
                .documentElement
                .style
                .colorScheme =
                theme;

        },
        [
            theme
        ]
    );


    /*
     * =====================================
     * VALUE DO CONTEXT
     * =====================================
     */

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


    /*
     * =====================================
     * RENDER
     * =====================================
     */

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