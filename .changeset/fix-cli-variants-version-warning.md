---
"@hex-core/cli": patch
"@hex-core/components": patch
"@hex-core/registry": patch
---

fix(cli): ship sibling/shared variants files, read version from package.json, surface broken internal deps

`@hex-core/cli@0.3.1` had three issues a fresh-project user hit on day one. This patch addresses all of them and adds a verification sweep so the same class of bug stops slipping through.

**`@hex-core/cli`** (patch):

- **`hex add button` now compiles.** Previously the CLI wrote `button.tsx` but not its sibling `button-variants.tsx`, so consumer projects failed with `Module not found: Can't resolve './button-variants'`. The registry build now auto-discovers sibling `*-variants.{ts,tsx}` files, cross-package variants imports (e.g. `pagination → button-variants`), and `_shared/*` files referenced by component sources, and bundles them into each registry manifest. Five components were affected: `button`, `pagination`, `grid`, `cluster`, `stack`.
- **`hex --version` now reports the real version.** The flag was hardcoded to `"0.1.0"` and had drifted across six releases. The CLI now reads `version` from its own `package.json` at runtime via `fileURLToPath(import.meta.url)`, so the printed version always matches the installed package.
- **Broken internal deps now warn instead of silently dropping.** `internalDepToSlug` accepts only the 3-segment path form (`primitives/<slug>/<slug>`); bare slugs returned `null` and were silently skipped, leaving `loading → skeleton`, `toggle-group → toggle`, and `form → label` with unresolvable imports. Those three schemas are now corrected, and `installOne` prints a visible warning when it sees a malformed dep so future authoring drift surfaces immediately.
- **Import rewriter** gained two rules for sibling-variants paths (`./button-variants` and `../../primitives/<dir>/<dir>-variants`), with six new unit tests covering the patterns.
- **README**: the unscoped-`hex-core` collision warning is promoted above Quickstart and reformatted as a `> [!WARNING]` GitHub admonition so first-time readers can't miss it.

**`@hex-core/components`** (patch):

- `loading.schema.ts`, `toggle-group.schema.ts`, `form.schema.ts` updated to use the canonical `primitives/<slug>/<slug>` form for internal deps, matching the convention already used by `data-table`.

**`@hex-core/registry`** (patch):

- All 77 component manifests regenerated. New `verify-add-all.ts` script runs `hex add <slug>` against every component in an isolated temp dir and asserts each `@/...` import resolves to a written file — caught the three bare-slug regressions above and is now part of the toolkit for future releases.
