/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        // FUNDOS
        sidebar: {
          DEFAULT: "#FAFAFA",
          selected: "#EFEFEC",
        },
        screen: "#F5F5F5",
        principal: {
          blue: "#2A4C61",
          green: "#78744C",
          white: "#FFFEFD",
        },
        text: {
          DEFAULT: "#303030",
          secondary: "#959595",
        },
        offWhite: "#E5E4DE",
        button: {
          gray: "#9E9D99",
          hover: "#BDBCB7",
        },
        table: {
          header: "#E8E8E8",
          body: "#F2F2F2",
        },
      },
    },
  },
  plugins: [],
};