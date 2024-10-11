/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        title: ["SUSE", "sans-serif"],
        body: ["Nanum Gothic", "sans-serif"],
        baloo: ['Baloo Tammudu', 'cursive'],
        laundry: ['LaundryGothicOTF', 'sans-serif'],
      },
      margin: {
        '30': '7.5rem',
        '19': '4.75rem',
      },
      colors: {
        customBlue: '#E0EAFF',
        customWhite: '#F8FAFF',
      },
    },
    keyframes: {
      'color-change': {
          '0%, 100%': { backgroundColor: '#2563EB' }, // 파란색 (blue-700)
          '50%': { backgroundColor: '#60A5FA' }, // 더 밝은 파란색 (blue-500)
      },
    },
    animation: {
      'color-change': 'color-change 1s infinite',
    },
  },
  plugins: [],
};
