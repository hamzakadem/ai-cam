/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#070807',
        panel: '#101210',
        line: '#292d28',
        acid: '#d9ff43',
        ember: '#ff6b35',
        mist: '#a9afa5',
      },
      fontFamily: {
        sans: ['"Avenir Next"', 'Avenir', '"Segoe UI"', 'sans-serif'],
        mono: ['"SFMono-Regular"', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      boxShadow: {
        'acid-glow': '0 0 0 1px rgba(217,255,67,.2), 0 18px 60px rgba(217,255,67,.1)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-12%)', opacity: '0' },
          '12%': { opacity: '1' },
          '88%': { opacity: '1' },
          '100%': { transform: 'translateY(900%)', opacity: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '.45', transform: 'scale(.96)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        scan: 'scan 2.4s cubic-bezier(.4,0,.2,1) infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
