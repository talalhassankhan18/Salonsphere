import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    ignores: [".next/**", "node_modules/**", "public/**", "logs/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Codebase-wide relaxations carried over from the previous config.
      // Tighten these incrementally as modules are cleaned up.
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "prefer-const": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Deliberately off: almost every <img> here is a Cloudinary URL from the
      // database, a user-uploaded file, or a base64 preview. Piping those
      // through next/image would route all of them via Vercel's optimizer
      // (1,000 source images/month on Hobby — a marketplace exceeds that and
      // images then fail), needs remotePatterns for arbitrary user URLs, and
      // Cloudinary already serves optimized assets.
      "@next/next/no-img-element": "off",
      // Apostrophes/quotes in JSX prose are fine; escaping them hurts readability.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
