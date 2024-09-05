/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        title: ["SUSE", "sans-serif"],
        body: ["Nanum Gothic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
