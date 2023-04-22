/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        3: "repeat(3, minmax(0, 277px))",
        2: "repeat(2, minmax(0, 277px))",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};

module.exports = config;
