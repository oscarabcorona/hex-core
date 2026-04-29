# Contributing to Hex UI

Thanks for wanting to help. Hex UI is an AI-native component library — every component ships with a machine-readable schema. A good contribution keeps that contract clean.

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

## Adding a component

1. Create `packages/components/src/{primitive|component}/<slug>/` with:
   - `<slug>.tsx` — React component (Radix + Tailwind + CVA where applicable)
   - `<slug>.schema.ts` — `ComponentSchemaDefinition` with required `ai` block (`whenToUse`, `whenNotToUse`, `commonMistakes`, `relatedComponents`, `accessibilityNotes`, `tokenBudget`)
2. Add a demo at `apps/docs/src/app/demos/<slug>-demo.tsx` and register it in `apps/docs/src/lib/demos.tsx`.
3. Run `pnpm run build:registry` — the registry JSON regenerates from your schema.
4. Run `pnpm build && pnpm --filter docs dev` and check `/docs/components/<slug>`.
5. Add a changeset: `pnpm changeset`. Pick the affected packages (usually `@hex-core/components`) and bump type.
6. Add a unit test alongside the component: `packages/components/src/**/<slug>.test.tsx`. Use [`button.test.tsx`](packages/components/src/primitives/button/button.test.tsx) as a template.

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
