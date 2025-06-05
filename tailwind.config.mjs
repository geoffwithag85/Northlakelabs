/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],  safelist: [
    'mobile-menu-open',
    'translate-x-full',
    'translate-x-0',
    'pointer-events-none',
    'pointer-events-auto',
    'opacity-0',
    'opacity-100',
    'backdrop-blur-sm',
    'backdrop-blur-xl',
    'shadow-2xl',
    'border-gray-700/50',
    'bg-burnt-sienna/10',
    'focus:ring-burnt-sienna/50',
    'focus:ring-offset-black-pearl',
    'group-hover:text-burnt-sienna',
    'group-hover:scale-110',
    'group-hover:translate-x-1'
  ],
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      width: {
        '15': '3.75rem',
      },
      height: {
        '15': '3.75rem',
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
