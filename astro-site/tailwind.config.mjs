/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'black-pearl': '#040b1b',
        'burnt-sienna': '#eb5b48',
        'royal-purple': '#5c37a9',
        'indigo': '#585ccc'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'pulse-custom': 'pulse-custom 2s infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' }
        },
        'pulse-custom': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' }
        }
      }
    },
  },
  plugins: [],
}
