/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                slate: { 750: '#2d3748', 850: '#1a202c', 950: '#0f172a' },
                blue: {
                    50: 'var(--color-primary-50)', 100: 'var(--color-primary-100)', 200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)', 400: 'var(--color-primary-400)', 500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)', 700: 'var(--color-primary-700)', 800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)', 950: 'var(--color-primary-950)',
                }
            },
            animation: {
                'pendulum': 'pendulum 6s ease-in-out infinite alternate',
                'twinkle': 'twinkle 4s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 3s infinite',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fadeIn 0.4s ease-out',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            keyframes: {
                pendulum: { '0%': { transform: 'rotate(4deg)' }, '100%': { transform: 'rotate(-4deg)' } },
                twinkle: { '0%, 100%': { opacity: 0.2, transform: 'scale(0.8)' }, '50%': { opacity: 0.8, transform: 'scale(1.1)' } },
                pulseSoft: { '0%, 100%': { opacity: 1, filter: 'brightness(1)' }, '50%': { opacity: 0.85, filter: 'brightness(1.2)' } },
                slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
            }
        }
    },
    plugins: [],
}
