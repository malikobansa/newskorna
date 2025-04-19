// .eslintrc.js
module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    // Customize rules as needed
    "@typescript-eslint/no-explicit-any": "warn", // Warn about 'any' types
    "react-hooks/exhaustive-deps": "error", // Good for Next.js apps
    "no-console": "warn", // Warn about console.log
    // Add other rules you want to customize
  },
  settings: {
    next: {
      rootDir: true, // Important for Next.js projects
    },
  },
};