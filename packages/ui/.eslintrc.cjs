module.exports = {
  root: true,
  extends: ["@portfolio/eslint-config/react-internal.js"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
}
