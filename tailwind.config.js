module.exports = {
  prefix: '',
  content: ['./src/**/*.html', './src/**/*.ts'],
  mode: 'jit',
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      zIndex: {
        60: '60',
        70: '70',
      },
      fontSize: {
        tiny: '0.6875rem',
      },
      colors: {
        primary: {
          DEFAULT: '#588157',
        },
        'notification-red': '#FF0000',
        'gray-lang': '#5B5959',
        'active-blue': '#398CFF',
      },
      width: {
        25: '99px',
        50: '12.5rem',
        125: '31.25rem',
        '(rem-screen)': 'calc(100vw - 24.5rem)',
      },
      height: {
        '(rem-screen)': 'calc(100vh - 4rem)',
        22: '90px',
        150: '37.5rem',
      },
      spacing: {
        18: '78px',
        25: '99px',
        66: '264px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
