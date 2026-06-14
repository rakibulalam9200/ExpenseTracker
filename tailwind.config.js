/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // NativeWind's built-in default has a typo: "san-serif" (missing 's').
        // This breaks Bengali/Bangla script rendering on Android because
        // Android can't find "san-serif" and falls back to a font without
        // Bengali glyph support. Override with the correct value.
        sans: ['sans-serif'],
        serif: ['serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};
