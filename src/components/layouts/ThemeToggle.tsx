import {
    useTheme
} from '../../hooks/useTheme';


export function ThemeToggle() {

    const {
        theme,
        toggleTheme
    } =
        useTheme();


    const isDark =
        theme ===
        'dark';


    return (

        <button

            type="button"

            className="theme-toggle"

            onClick={
                toggleTheme
            }

            aria-label={
                isDark
                    ? 'Ativar modo claro'
                    : 'Ativar modo escuro'
            }

            title={
                isDark
                    ? 'Ativar modo claro'
                    : 'Ativar modo escuro'
            }

        >

            <span
                className="theme-toggle-icon"
                aria-hidden="true"
            >

                {
                    isDark
                        ? '☀️'
                        : '🌙'
                }

            </span>

        </button>

    );

}