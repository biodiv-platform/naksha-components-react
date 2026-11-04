import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

export default [
  ...nextConfig,
  prettierConfig,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
