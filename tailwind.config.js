/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // controle manual (OBRIGATÓRIO)

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },

      colors: {
        sidebar: {
          DEFAULT: "var(--sidebar)",
          selected: "var(--sidebar-selected)",
        },

        header: "var(--header)",
        screen: "var(--screen)",

        principal: {
          blue: "var(--principal-blue)",
          green: "var(--principal-green)",
          white: "var(--card)",
        },

        text: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },

        offWhite: "var(--offWhite)",

        button: {
          gray: "var(--button-gray)",
          hover: "var(--button-hover)",
        },

        table: {
          header: "var(--table-header)",
          body: "var(--table-body)",
        },
        danger: "var(--danger)",
        success: "var(--success)",
      },
    },
  },

  plugins: [],
};