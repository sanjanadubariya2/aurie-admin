/** @type {import('tailwindcss').Config} */
/* Same tokens as aurie-storefront. Keep the two files in sync — if you change
   a colour here, change it there. The admin is a tool, not a shopfront, so it
   leans on the neutrals and uses ember sparingly. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        soot: '#17150F',
        ink: '#2A261E',
        smoke: '#6F675C',
        ash: '#E5E2DB',
        wax: '#FBFAF6',
        wick: '#D3CEC3',
        ember: '#C1441E',
        glow: '#FFB65C',
        sea: '#3E5C63',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: { 13: '3.25rem' },
      letterSpacing: { label: '0.14em' },
      borderRadius: { card: '18px' },
      boxShadow: { lift: '0 18px 40px -22px rgba(23,21,15,0.35)' },
      keyframes: {
        slideLeft: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        slideUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        flicker: {
          '0%,100%': { opacity: 0.85, transform: 'scale(1)' },
          '45%': { opacity: 1, transform: 'scale(1.06)' },
          '70%': { opacity: 0.78, transform: 'scale(0.97)' },
        },
      },
      animation: {
        slideLeft: 'slideLeft 300ms cubic-bezier(.2,.8,.2,1)',
        slideUp: 'slideUp 320ms cubic-bezier(.2,.8,.2,1)',
        fadeIn: 'fadeIn 220ms ease both',
        flicker: 'flicker 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
