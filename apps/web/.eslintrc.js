module.exports = {
  root: true,
  extends: ["@portfolio/eslint-config/next.js"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
}
