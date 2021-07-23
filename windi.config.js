import { transform } from 'windicss/helpers'

export default {
  plugins: [transform("daisyui")],
  extract: {
    include: ['src/**/*.{html,svelte}'],
    exclude: ['node_modules', '.git'],
  },
  darkMode: 'class'
};
