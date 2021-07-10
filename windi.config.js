const { transform } = require("windicss/helpers");

module.exports = {
  plugins: [transform("daisyui")],
  extract: {
    include: ['src/**/*.{html,svelte}'],
    exclude: ['node_modules', '.git'],
  },
};
