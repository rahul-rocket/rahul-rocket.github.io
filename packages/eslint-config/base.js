/**
 * Shared ESLint base for every package in the monorepo.
 *
 * `only-warn` downgrades everything to a warning so a stray lint rule never
 * blocks a build; CI is the place to gate on it.
 */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "eslint-config-prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "only-warn"],
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
  },
  ignorePatterns: ["node_modules/", "dist/", ".next/", ".turbo/", "*.config.js"],
}
