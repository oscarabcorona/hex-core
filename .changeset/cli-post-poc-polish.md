---
"@hex-core/cli": patch
---

fix(cli): post-POC polish — v4 bridge restores `hex theme edit`, recipes-in-list, theme apply, sonner hint

Backfill changeset for PR #92 (commit `c967659`, merged 2026-04-28). PR #92 shipped 7 fixes after a real POC against `cli@0.2.2` but never landed a changeset, leaving the cli stuck on main without a release path. This changeset triggers `cli@0.2.3` so users hitting the actively-broken `hex theme edit` v4 path get the fix on npm.

The seven items in PR #92:

| Commit | Fix | Why it matters |
|---|---|---|
| `857aaba` | **Fix B (the real bug)** — v4 globals.css uses the bridge pattern: `:root { --primary: VALUE }` + `@theme inline { --color-primary: hsl(var(--primary)) }`. The previous shape inlined color values directly into `@theme {}`, which works for `bg-primary` utilities but eliminates the raw `--primary: VALUE` triplet that `hex theme edit`'s regex hunts for. Result: `hex theme edit` silently no-op'd on every v4 install. | Critical — `hex theme edit` is a documented command. Users hitting the v4 path on `cli@0.2.2` see no error, no diff, no token change. |
| `2d18084` | **Fix A** — `npx hex-core` typo callout in root + cli READMEs (unscoped `hex-core` on npm is owned by an unrelated author). | Prevents users from `npx`-installing the wrong package. |
| `6e581c9` | **Fix C** — silent skip for shared `lib/*` files on re-add; preserves customizations. No more `Skip: lib/utils.ts (use --overwrite)` nag. | Cleaner re-add UX; users who customized `lib/utils.ts` keep their edits. |
| `89acbde` | **Fix D** — recipes section in `hex list` with "Try one: hex recipe add <slug>" CTA. | Killer feature was buried behind a separate command; now discoverable in the default `hex list`. |
| `e2a6141` | **Fix E** — drop unused `hooks` alias from default `hex.config.json` (no registry item references it). | Cleaner default config; one less thing to explain. |
| `9cce7aa` | **Fix F** — Toaster mount reminder after `hex add sonner` so users don't silently hit "no toast appears." | Sonner needs a mount point; surfacing the requirement saves debugging time. |
| `424874e` | **Fix G** — `hex theme apply <preset>` for surgical theme switches; replaces only `:root` + `.dark` token bodies, preserves user customizations and the `@theme inline` bridge. | New command; complements `hex theme edit`. |

**Tests:** PR #92 already shipped 96 cli tests + 39 tokens tests covering all 7 fixes. No additional test work in this changeset.
