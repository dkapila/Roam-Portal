module.exports = {
  root: true,
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:prettier-vue/recommended",
  ],
  plugins: ["@typescript-eslint", "prettier"],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
};
