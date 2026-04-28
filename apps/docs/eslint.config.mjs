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
  ]),
  // Pin React version explicitly so eslint-plugin-react doesn't auto-detect.
  // Auto-detection in eslint-plugin-react@7.37.5 calls `context.getFilename()`
  // which was removed in eslint@10 (replaced with `context.filename`); pinning
  // `settings.react.version` skips that broken codepath. Required for
  // dependabot's eslint 9 → 10 bump (PR #85). Drop this once
  // eslint-plugin-react ships an eslint-10-compatible release.
  {
    settings: {
      react: {
        version: "19.2.5",
      },
    },
  },
]);

export default eslintConfig;
