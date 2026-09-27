// eslint.config.mjs
import reactHooksPlugin from "eslint-plugin-react-hooks";
import typescriptParser from "@typescript-eslint/parser";

export default [
  // Common configuration
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.docusaurus/**",
    ],
  },

  // JavaScript files
  {
    files: ["**/*.{js,jsx,mjs}"],
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Add TypeScript-specific rules here
    },
  },
];
