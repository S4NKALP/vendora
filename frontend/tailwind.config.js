/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary : "#704f38",
        secondary : "#745649",
        btnPrimary: "#eee5d8"
      }
    },
  },
  plugins: [],
}