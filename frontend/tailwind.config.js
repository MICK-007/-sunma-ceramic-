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
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Didot', 'Bodoni MT', 'Cinzel', 'serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        architectural: '0.25em',
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
};
