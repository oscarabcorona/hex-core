# Contributing to Hex Core

Thanks for wanting to help. Hex Core is an AI-native component library — every component ships with a machine-readable schema. A good contribution keeps that contract clean.

## Prerequisites

- Node.js 20.9 or newer
- pnpm 9.15.0 (`corepack enable` or install manually)

## Development

```bash
pnpm install
pnpm --filter docs dev       # Docs app at http://localhost:3000
pnpm build                    # Build every package
pnpm run build:registry       # Regenerate registry/*.json from schemas
pnpm --filter docs test       # Playwright e2e (8 tests across 3 specs)
```

## Conventions (non-negotiable)

- **SOLID + DRY** — single source of truth. If you write the same list twice, extract it.
- **Types** — no `as Type` casts, no `as unknown as`, no `any`, no index signatures just to satisfy a generic. Use `unknown` + runtime narrowing or typed wrappers at library boundaries.
- **Headless** — logic lives in hooks; components stay pure and prop-driven. Keep `"use client"` at leaves.
- **Dogfood** — if the docs app needs a primitive we already ship in `@hex-core/components`, import it from the library.
- **Canonical transitions** — `transition-all duration-200 ease-out` for interactive surfaces. Focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

## Type safety

No `any`. No `as Type` on a value you control. **`as unknown as T` is banned outright** and enforced by ESLint — it is the one assertion form that turns any value into any other with no overlap check at all.

| Instead of… | Use… |
|---|---|
| `as SomeType` on an object literal | `satisfies SomeType` |
| `as ResponseType` on parsed JSON | a Zod `.parse()` at the boundary |
| `as UnionMember` on a string | a type guard (`isCategory(x)`) |
| `as HTMLElement` on a DOM value | `instanceof HTMLElement` |
| `window as unknown as { … }` | `declare global { interface Window { … } }` |
| `as unknown as T` to widen a fixture | an intersection: `T & Record<string, unknown>` |
| `expr!` | `if (expr)` or `?? fallback` |

`eslint-disable` is a last resort, not a fix. Every one needs a `-- reason` suffix.

## Layer boundaries

Radix is an implementation detail of the **primitive** and **component** layers. Anything in `blocks/`, `ai/` or `artifacts/` composes what those layers export instead of reaching past them — a direct `@radix-ui/*` import there is an ESLint error.

```
tokens ← components/{primitives,components} ← {blocks,ai,artifacts} ← apps/docs
                    ↑ only these two import @radix-ui/*
```

Colour literals are restricted the same way: no hex or `hsl(…)` with literal channels outside `packages/tokens` and `packages/themes`. Read a token instead — `bg-primary`, or `hsl(var(--border))`.

One documented exception exists today: `ai/inline-citation` drives `HoverCardPrimitive` directly because the shared `HoverCardContent` hardcodes `w-64` and its own padding. It moves onto the primitive when that grows a size variant.

## Where new code goes

One consumer → colocate it. Two or more → promote it.

| Scope | Location |
|---|---|
| Everything about one component | `packages/components/src/{primitives\|components\|ai\|artifacts\|blocks}/<slug>/` |
| Shared by 2+ components | `packages/components/src/lib/` (own tsup entry — stays RSC-safe) |
| Shared by 2+ packages | its own `packages/<name>` |
| Used by one docs route | that route's folder |
| Used by 2+ docs routes | `apps/docs/src/components/` or `apps/docs/src/lib/` |

## Adding a component

Everything about a component lives in one folder. Create
`packages/components/src/{primitives|components|ai|artifacts|blocks}/<slug>/`:

```
<slug>.tsx          React component (Radix + Tailwind + CVA where applicable)
<slug>.schema.ts    ComponentSchemaInput — the machine-readable spec
<slug>.test.tsx     unit test (see button.test.tsx as a template)
<slug>.demo.tsx     the demo the docs site renders
```

Then run **one** command:

```bash
pnpm build          # regenerates every list that mentions your component
```

That is the whole checklist. No barrel to edit, no demo map to register in,
no skip-list to update — the runtime barrel, the schema barrel, the docs demo
map and the visual-test skip set are all generated from this folder by
`scripts/build-barrels.ts`. Six hand-maintained copies of "the list of
components" used to exist, and they had already drifted: 53 of 161 schemas
were missing from the schema barrel, every block among them.

Only declare what you actually know. `props`, `variants`, `slots`,
`tokensUsed`, `examples` and `tags` all default to empty, `dependencies` is
re-derived from your imports, and `ai.tokenBudget` is measured from the
emitted registry item. A minimal schema is about fifteen lines:

```ts
import type { ComponentSchemaInput } from "@hex-core/registry";

export const chipSchema: ComponentSchemaInput = {
  name: "chip",
  displayName: "Chip",
  description: "A compact inline label for tags and filters.",
  category: "primitive",
  ai: {
    whenToUse: "Short inline labels inside dense lists.",
    whenNotToUse: "Use Badge for status; Tag for removable entries.",
    commonMistakes: ["Using Chip for interactive filters — use Toggle."],
    relatedComponents: ["badge", "tag"],
    accessibilityNotes: "Decorative by default; add aria-label when meaningful.",
  },
};
```

The `ai` block stays mandatory — it is what makes the catalog usable by an
agent, and no build step can infer it.

To keep an export out of the public API, tag its declaration `@internal`;
the barrel generator skips those.

Finally:

1. `pnpm run build:registry` — regenerates `registry/` from your schema.
2. `pnpm --filter docs dev` and check `/docs/components/<slug>`.
3. `pnpm changeset` — pick the affected packages and bump type.

## Changing a colour

Edit one line in [`packages/tokens/src/themes/default.ts`](packages/tokens/src/themes/default.ts), then `pnpm run build:tokens`.

Colours are two-tier. The `palette` const holds every literal exactly once;
semantic tokens draw from it via `ref("slate-900")`, which records where the
value came from. The CSS emitter turns that into `--primary: var(--slate-900)`,
so overriding one ramp entry re-tints everything drawn from it — including in
a consumer's own stylesheet.

`apps/docs/src/app/tokens.generated.css` is generated by the same function
that `hex theme init` gives consumers, so the docs site can no longer drift
from what the CLI ships. It previously did: the theming page advertised a
`--destructive` that had been wrong for months.

## Generated files

`*.generated.*` files are build output that happens to be committed, so the
tree typechecks without a build step. Never hand-edit them — CI diffs them
after a clean build and fails on drift.

| File | Generator |
|---|---|
| `packages/components/src/index.generated.ts` | `scripts/build-barrels.ts` |
| `packages/components/src/schemas.generated.ts` | `scripts/build-barrels.ts` |
| `apps/docs/src/lib/demos.generated.tsx` | `scripts/build-barrels.ts` |
| `packages/themes/src/presets/briefs.generated.ts` | `scripts/build-barrels.ts` |
| `apps/docs/src/app/tokens.generated.css` | `scripts/build-tokens.ts` |
| `registry/**` | `scripts/build-registry.ts` |
| `packages/mcp-server/README.md` | `packages/mcp-server/scripts/build-readme.mjs` |

Every generator is deterministic — directories are sorted, so output is
byte-stable across machines and drift shows up as an ordinary `git diff`.

## Tests

Hex Core uses **[Vitest](https://vitest.dev/)** for unit tests + **[Playwright](https://playwright.dev/)** for docs e2e + **[axe-core](https://github.com/dequelabs/axe-core)** for accessibility.

- `pnpm test` — run everything (vitest across packages + playwright in apps/docs) via turbo
- `pnpm --filter @hex-core/components test` — component unit tests only
- `pnpm --filter @hex-core/registry test` — schema-drift guard (parses every `registry/**/*.json` through Zod)
- `pnpm --filter docs test` — e2e browser tests only
- `pnpm run a11y-audit` — full axe-core scan of every component demo in light + dark. **Local-only gate before releasing**; not in CI by default (the audit takes ~10 min and exceeded the workflow timeout the only time we wired it to push). Fails on critical/serious violations.
- `pnpm --filter docs test:visual` — Playwright screenshot diff against committed baselines under `apps/docs/e2e/visual.spec.ts-snapshots/`. Per-platform suffixes; refresh runbook at `apps/docs/e2e/visual.spec.ts-snapshots/README.md`.
- `pnpm regression` — composes `build` + `build:registry` + `a11y-audit` + `test:visual`. The canonical pre-release gate; run it before invoking `/release`.

Templates:

- **Component unit test:** [`packages/components/src/primitives/button/button.test.tsx`](packages/components/src/primitives/button/button.test.tsx) — render, variant switching, keyboard a11y, ref forwarding, asChild composition.
- **Schema validation:** [`packages/registry/test/validate-registry.test.ts`](packages/registry/test/validate-registry.test.ts) — walks every JSON and enforces the registry contract.

Every new component should land with a unit test. Every schema change should keep the validation suite green.

## Accessibility (WCAG 2.2 AA)

Every component demo page is scanned by `pnpm run a11y-audit` in both light and dark mode. The audit fails on **any** `critical` or `serious` axe-core violation. Run it locally before releasing — it's the canonical gate (folded into `pnpm regression`); not in CI.

Required for new components / demo updates:

1. Any interactive control without an associated `<label htmlFor>` — provide `aria-label` or `aria-labelledby`. This includes Input, Textarea, Combobox, Select, Slider, InputOTP, Switch, Checkbox, RadioGroup, ToggleGroup, and any custom control with `role="combobox" | "slider" | "listbox" | "switch" | "checkbox" | "radio"`. Roles like `combobox` and `slider` cannot derive their name from contents.
2. Color contrast — text must reach **4.5:1** against its background; non-text UI (focus rings, borders that carry meaning) must reach **3:1**. Run `pnpm run a11y-audit` locally before pushing — the report at `a11y-report.md` lists every failing selector.
3. Composite widgets — when wrapping Radix (Slider, ScrollArea, etc.), ensure each child interactive element has its own accessible name. The `Slider` wrapper auto-derives thumb labels from the Root's `aria-label`; pass `thumbLabels={["Min", "Max"]}` for range sliders.
4. Long content — `DialogContent` is constrained to `max-h-[calc(100vh-2rem)]` with `overflow-y-auto` so the focus trap stays around scrollable content.

## Releasing

Hex Core ships from `main` via the [`release` skill](.claude/commands/release.md). One long-lived branch; feature PRs land directly. The skill consumes pending changesets, publishes to npm, tags, and creates the GitHub Release.

### Workflows

- **`.github/workflows/ci.yml`** — fires on PR + push to `main`. Three parallel jobs (`Lint` / `Build` / `Test`, ~2 min). Gates merging to `main`.
- **`.github/workflows/regression.yml`** — `workflow_dispatch` only. Slow regression suite (a11y axe-scan + Playwright visual diffs); use when you want artifact uploads. The first-class pre-release gate is `pnpm regression` locally.

### Pre-release gate

Before invoking `/release`, run:

```bash
pnpm regression
```

This composes `build` + `build:registry` + `a11y-audit` + `test:visual` — the slow checks CI doesn't run on every PR. Non-zero exit blocks the release.

## Submitting a PR

- Branch name: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`, `test/<scope>`.
- Target `main`.
- One logical change per commit. Imperative mood, ≤ 65 chars subject, explain why not what.
- `pnpm run lint`, `pnpm build`, `pnpm test` must pass.
- PR description follows the template.

## Code of conduct

This project adopts the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to abide by it. Report violations to oabc4004@gmail.com.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
