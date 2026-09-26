module.exports = {
  "*.{js,jsx,mjs}": ["pnpm eslint --fix", "pnpm prettier --write"],
  "*.{ts,tsx}": ["pnpm prettier --write"],
  "*.{json,css,md,mdx}": ["pnpm prettier --write"],
};
