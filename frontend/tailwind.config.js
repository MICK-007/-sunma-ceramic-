/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          card: 'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          hover: 'var(--color-gold-hover)',
          muted: 'var(--color-gold-muted)',
        },
        stone: {
          DEFAULT: 'var(--color-stone)',
          dark: 'var(--color-stone-dark)',
          light: 'var(--color-stone-light)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          gold: 'var(--color-border-gold)',
        },
        txt: {
          main: 'var(--color-text-main)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        contrast: {
          bg: 'var(--color-contrast-bg)',
          surface: 'var(--color-contrast-surface)',
          border: 'var(--color-contrast-border)',
          text: 'var(--color-contrast-text)',
          muted: 'var(--color-contrast-muted)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'var(--font-thai)', 'Playfair Display', 'Cinzel', 'Didot', 'serif'],
        body: ['var(--font-body)', 'var(--font-thai)', 'Inter', 'system-ui', 'sans-serif'],
        thai: ['var(--font-thai)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        architectural: '0.25em',
        widest: '0.2em',
        wider: '0.1em',
        tight: '-0.02em',
      },
      boxShadow: {
        editorial: '0 12px 32px -8px rgba(21, 22, 24, 0.08), 0 0 1px 1px rgba(142, 126, 99, 0.15)',
        'editorial-lg': '0 24px 48px -12px rgba(21, 22, 24, 0.12)',
      },
    },
  },
  plugins: [],
};
