/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        main: "#2C2C2C",
        sub: "#FF7A00",
        darkgray: "#666666",
        lightgray: "#666666",
      },
      fontFamily: {
        reggae: ["Montserrat"],
      },
    },
  },
  plugins: [],
};
