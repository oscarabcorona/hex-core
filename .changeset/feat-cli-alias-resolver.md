---
"@hex-core/cli": minor
---

feat(cli): tsconfig-aware alias resolver, `theme add --from <studio-url>`, granular `--overwrite`, doctor drift check, `--dry-run`, manifest add

Closes the @hex-core/cli@0.4.0 feedback (P0 alias-resolution bug + Studio integration). Single PR covers every item in the review.

**Bug fixes:**

- **`hex add` honors `tsconfig.json#paths` and `--src-dir` Next.js layout.** A new resolver (`packages/cli/src/lib/resolve-alias.ts`) consults `tsconfig.json#compilerOptions.paths["@/*"]` (with `extends`-chain support) first, falls back to a `src/` heuristic, and finally to cwd-relative. Components and lib utilities now land where the project's import system expects them — no more `mv components src/components` after every install.
- **`hex doctor` warns on alias drift.** When components live at `<cwd>/components/ui` but the resolver expects `<cwd>/src/components/ui` (or vice-versa), doctor surfaces the exact `mv` command to fix it.
- **`hex init` detects `src/` layout** and prints `Detected src/ layout — components will be written under src/components/.` so the user knows where future writes go.
- **`hex recipe add <slug>` no longer fails typecheck** (was missing `install` on the AddOptions spread). Now passes `install: true` explicitly so peer deps are resolved end-to-end.
- **TS export identifier sanitization** in `renderThemeAsTs`. Kebab-case slugs (`midnight-custom`) now emit `export const midnightCustomTheme` instead of the invalid `export const midnight-customTheme`.

**New features:**

- **`hex theme add <slug> --from <studio-url>`** — compose a custom theme from a Hex Core Studio URL and write it as TypeScript. Parses `?base=<preset>&radius=<rem>&<token>_<mode>=<HSL-triplet>` params, applies via `extendTheme`, serializes through `renderTheme(..., "ts")`, writes to `src/themes/<slug>.ts` (or `themes/<slug>.ts`).
- **`hex add --dry-run`** — plan but do not write files or run installs. Prints `Would write:` for every file that would be created plus a per-run summary.
- **`hex add --from <manifest>`** — install every slug from a `hex.components.json`-style file (`{ "components": ["button", "card"] }`). Errors if mixed with positional args.
- **`hex init --overwrite=globals.css,tailwind.config.ts`** — granular file replacement. Bare `--overwrite` still means "all" for backwards compat.
- **`hex init --check`** — runs the doctor inline and exits non-zero on drift. CI / pre-commit safe.
- **`hex recipe list` and `hex recipe --help`** — recipe listing surfaced.

**Polish:**

- Resolved paths in every `Write:` log line (was the raw registry path).
- Color output via `picocolors` (already a dep). Respects `NO_COLOR` and TTY detection.
- TTY-aware install spinner during peer-dep resolution.

**Migration for `--src-dir` users on 0.4.0:**

If you ran `hex add` on 0.4.0 in a `pnpm create next-app --src-dir` project, your components are at `<cwd>/components/ui/` instead of `<cwd>/src/components/ui/`. Run `hex doctor` — the drift warning prints the exact `mv` command. After moving, future `hex add` invocations land in the correct directory automatically.
