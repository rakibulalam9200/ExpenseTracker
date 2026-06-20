/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef0ff',
          100: '#e0e4ff',
          200: '#c7ccff',
          300: '#a3adff',
          400: '#7a8bff',
          500: '#4d5dff',
          600: '#191970', // Midnight Blue
          700: '#1a185e',
          800: '#15154c',
          900: '#11133f',
        },
        secondary: {
          50: '#ecfdf1',
          100: '#d1fae0',
          200: '#a7f3c8',
          300: '#6ee7ab',
          400: '#34d38c',
          500: '#218544', // Green
          600: '#166934',
          700: '#13542b',
          800: '#114223',
          900: '#0f361f',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00AFCD', // Light Cyan
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        }
      },
      fontFamily: {
        sans: ['sans-serif'],
        serif: ['serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};
