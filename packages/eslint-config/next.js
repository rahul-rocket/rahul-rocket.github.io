/** ESLint config for Next.js applications (apps/web). */
module.exports = {
  extends: ["./base.js", "next/core-web-vitals"],
  env: {
    browser: true,
  },
  settings: {
    react: { version: "detect" },
  },
}
