import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Never lint build output or dependencies at any depth. Committed build
    // artifacts used to bury real findings under thousands of generated ones.
    "**/.next/**",
    "**/node_modules/**",
    "**/out/**",
    // Git-ignored scratch space for write-up source material. It holds whole
    // other projects, and linting them buried this repo's findings under
    // 34k unrelated ones.
    "ContextFolder/**",
  ]),
]);

export default eslintConfig;
