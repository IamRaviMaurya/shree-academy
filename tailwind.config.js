/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F1FB',
          100: '#B5D4F4',
          200: '#B5D4F4',
          600: '#185FA5',
          800: '#0C447C',
          900: '#042C53',
        },
        success: {
          50: '#EAF3DE',
          100: '#9FE1CB',
          200: '#9FE1CB',
          600: '#3B6D11',
          800: '#27500A',
        },
        warning: {
          50: '#FAEEDA',
          600: '#854F0B',
          800: '#633806',
        },
        danger: {
          50: '#FCEBEB',
          100: '#F7C1C1',
          200: '#F7C1C1',
          600: '#A32D2D',
          800: '#791F1F',
        },
        info: {
          50: '#E1F5EE',
          100: '#B5D4F4',
          200: '#B5D4F4',
          600: '#0F6E56',
          800: '#085041',
        },
        gray: {
          50: '#F1EFE8',
          200: '#B4B2A9',
          600: '#5F5E5A',
          800: '#444441',
        },
        background: '#F7F6F3',
        surface: '#FFFFFF',
        'surface-2': '#F1EFE8',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        'lg': '14px',
      },
      boxShadow: {
        'sm': '0 1px 4px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}