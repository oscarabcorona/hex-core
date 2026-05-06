---
"@hex-core/components": minor
"@hex-core/cli": patch
---

feat(blocks): introduce blocks tier — `AuthAdapter` contract + first vertical-slice `auth-sign-in-split`

Blocks are the third tier above primitives and components: page-level compositions (sign-in pages, landing heroes, app shells) that share the registry, schema convention, and `hex add` install surface. This release ships the foundation and the first concrete block end-to-end so the pipeline is proven on a real artifact.

**`@hex-core/components` — new exports:**

- `AuthAdapter`, `AuthAdapterResult`, `AuthOtpIntent`, `AuthSocialProvider` — pluggable contract every auth block consumes via its `adapter` prop. Hex Core ships no session management; the adapter routes credential / OAuth handoffs to whatever the consumer wires up (better-auth, Clerk, NextAuth, Supabase Auth, custom server). Every method is optional so consumers can ship password-only on day one and add passkeys later without forking block source.
- `mockAuthAdapter` — in-memory reference adapter for showcase routes and tests. Every method delays 400ms and resolves `{ ok: true }`. Never ship in production.
- `AuthSignInSplit`, `AuthSignInSplitProps`, `AuthSignInSocialProvider` — split-screen sign-in page block. Marketing panel on the left (≥lg), credential form on the right with email + password, remember-me, optional GitHub/Google/Microsoft social buttons, forgot-password link, and a destructive Alert error surface. Composes `form`, `input`, `label`, `button`, `checkbox`, `alert`, `separator`.

**`@hex-core/cli` — `rewrite-imports` fix for cross-tree block imports:**

The legacy regex matched sibling-component imports (`../<name>/<name>`) and primitives (`../../primitives/<name>/<name>`) but not the cross-tree shape blocks need: a block at `blocks/<slug>/<slug>.tsx` reaches into `components/` two segments deep. `npx hex add auth-sign-in-split` now rewrites `../../components/alert/alert` to `@/components/ui/alert` correctly. Covered by a new unit test.

**Pipeline coverage shipped in this release:**

- Block component + co-located `.schema.ts` (auto-discovered by `pnpm build:registry`)
- Recipe `auth-sign-in.recipe.ts` (8 ordered steps + author-written checklist + auto-derived items from each component's commonMistakes / accessibilityNotes)
- Live demo + `/sign-in` showcase route in `apps/docs`
- Concept doc at `/docs/blocks` with embedded preview, install commands, and roadmap
- MCP contract test asserts `search_components({ category: "block" })` returns ≥1 result and `get_component("auth-sign-in-split")` round-trips with the required `adapter` prop and bundled `components/_shared/auth-adapter.tsx` source
- A11y audit clean on the showcase route in light + dark
- Visual regression baselines committed for auth-sign-in-split (light + dark)

No breaking changes. Existing consumers' bundles are unaffected — blocks tree-shake; consumers only pay for what they install.
