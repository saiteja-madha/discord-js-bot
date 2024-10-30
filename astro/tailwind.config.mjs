/** @type {import('tailwindcss').Config} */
import colors, { blue, cyan, neutral, pink, sky, slate } from 'tailwindcss/colors';
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './node_modules/preline/preline.js',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
      gray: colors.gray,
      pink: colors.pink,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      discord: {
        blurple: '#5865f2',
      },
      neutral: colors.neutral, // Used mainly for text color
      slate: colors.slate, // Used mainly for background color
      cyan: colors.cyan, // Accent colors, used mainly for star color, heading and buttons
      fuchsia: colors.fuchsia, // Primary colors, used mainly for links, buttons and svg icons
      neutral: colors.neutral, // Used mainly for text color
      red: colors.red, // Used for bookmark icon
      zinc: colors.zinc, // Used mainly for box-shadow
    },
    extend: {},
  },
  plugins: [
    require('tailwindcss/nesting'),
    require('preline/plugin'),
    require('@tailwindcss/forms'),
  ],
};
