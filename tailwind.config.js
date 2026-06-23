/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        red:        '#E24B4A',
        redLight:   '#FCEBEB',
        redDark:    '#A32D2D',
        green:      '#3B6D11',
        greenLight: '#EAF3DE',
        greenMid:   '#639922',
        amber:      '#EF9F27',
        amberLight: '#FAEEDA',
        amberDark:  '#854F0B',
        teal:       '#0F6E56',
        tealLight:  '#E1F5EE',
        blue:       '#185FA5',
        blueLight:  '#E6F1FB',
        gray:       '#F1EFE8',
        grayMid:    '#5F5E5A',
        grayLight:  '#D3D1C7',
      },
    },
  },
  plugins: [],
};
