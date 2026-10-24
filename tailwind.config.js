/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: 'var(--color-forest, #0A6847)',
          dark: 'var(--color-forest-dark, #044E32)',
          light: 'var(--color-forest-light, #118B5F)',
        },
        fresh: {
          DEFAULT: 'var(--color-fresh, #10B981)',
          dark: 'var(--color-fresh-dark, #059669)',
          light: 'var(--color-fresh-light, #34D399)',
          50: '#ECFDF5',
        },
        ivory: {
          DEFAULT: 'var(--color-ivory, #F8FAF8)',
          50: '#FFFFFF',
          100: 'var(--color-ivory-100, #EEF4EF)',
          200: 'var(--color-ivory-200, #DCE8DF)',
        },
        warmYellow: {
          DEFAULT: 'var(--color-warm-yellow, #F59E0B)',
          dark: 'var(--color-warm-yellow-dark, #D97706)',
          light: 'var(--color-warm-yellow-light, #FBBF24)',
        },
        charcoal: {
          DEFAULT: 'var(--color-charcoal, #141E17)',
          muted: '#455A4B',
          light: '#728878',
        },
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 14px -2px rgba(10, 104, 71, 0.08), 0 4px 16px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(10, 104, 71, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'hover': '0 14px 30px -4px rgba(10, 104, 71, 0.16), 0 6px 14px -2px rgba(0, 0, 0, 0.05)',
        'sticky': '0 4px 20px -2px rgba(0, 0, 0, 0.07)',
      },
    },
  },
  plugins: [],
}
