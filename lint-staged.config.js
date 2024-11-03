/** @type {import('lint-staged').Config} */
const config = {
  // Start with just Prettier formatting to test
  '**/*.{ts,tsx,js,jsx,json,md}': ['prettier --write'],
}

module.exports = config
