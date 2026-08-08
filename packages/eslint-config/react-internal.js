/** ESLint config for internal React component libraries (packages/ui). */
module.exports = {
  extends: [
    "./base.js",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  env: {
    browser: true,
  },
  settings: {
    react: { version: "detect" },
  },
  rules: {
    "react/prop-types": "off",
    // shadcn components carry library-specific attributes (cmdk-*, vaul-*) that
    // this rule cannot know about.
    "react/no-unknown-property": ["warn", { ignore: ["cmdk-input-wrapper"] }],
  },
}
