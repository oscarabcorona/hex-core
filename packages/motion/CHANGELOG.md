# @hex-core/motion

## 0.3.3

### Patch Changes

- 993571d: Replace `track`'s one-line `accessibilityNotes` stub with a real note (structural label, reduced-motion behavior inherited from child Clips) — the single hard failure under the new `verify:schema-quality` gate.

## 0.3.2

### Patch Changes

- c2ce968: Colocate each motion component's demo with the component.

  Demos are excluded from the published bundle; they exist so the docs site can
  render one folder per component rather than a separate demos directory plus a
  hand-maintained map.

## 0.3.1

### Patch Changes

- 1264d32: Token-cost audit + calibration across every LLM-bound surface.

  **`@hex-core/payload`** — Bundled registry now resolves the page-recipe build path correctly: `scripts/build-registry.ts` branches on `recipe.kind` so the build no longer fails on `kind: "page"` recipes. The bundled `registry/items/` grew from 132 to 183 entries (51 blocks + AI elements + motion primitives that were previously stranded by the build).

  **`@hex-core/components` / `@hex-core/motion`** — Every component's `ai.tokenBudget` is now calibrated against the measured wire-shape (pretty-printed) `get_component_schema` token count — the shape MCP clients actually receive and rank by. Most primitives were under-declaring by 2–3× (`button` was 500 → 1,718; `cluster` was 250 → 938). Declared vs. measured is now within ±1 token across all 183 items. Wire output is unchanged; only the declared estimates were wrong.

  **`@hex-core/mcp`** — Added a contract-test regression gate: `get_component` ≤ 15K tokens, `get_component_schema` ≤ 2.5K, `emit_app_context` (N=20) ≤ 5K. Wire output remains pretty-printed (human-readable for debugging); ceilings reflect the actual response shape with ~20% headroom over current max.

  New maintenance script at `scripts/audit-tokens.ts` (`pnpm audit:tokens`) measures every LLM-bound surface — MCP tool responses, recipes, skills, the bundled registry — and writes `packages/mcp-server/TOKEN_AUDIT.md`. Pass `--update-budgets` to push measured numbers back into each schema's `ai.tokenBudget` literal. The audit asserts the bundled `@hex-core/payload` registry stays in sync with the repo-root `registry/` and bails loud if they drift.

  Realistic compound load (4 SKILL.md packs + `emit_app_context` at N=20 + 1 page-recipe) is ~10K tokens — 5% of Claude's 200K window. There is no context-window pressure; this PR ships measurement, calibration, and a regression gate so future surface additions don't silently bloat MCP responses.

## 0.3.0

### Minor Changes

- b28f8ee: feat(motion): Phase 2 popular-animation catalog — 15 wrappers + landing-hero recipe

  Adds 15 opinionated wrapper components to `@hex-core/motion`, all built on the Phase 1 engine. Every wrapper is a registry item; consumers reach them via `npx @hex-core/cli add <slug>` (which records the npm peer) or by importing the named export directly.

  **Wrappers**
  - Entry/exit (5): `FadeIn`, `SlideIn`, `ScaleIn`, `BlurIn`, `Pulse`
  - Composing (4): `Bounce`, `Shine`, `Stagger`, `RevealOnScroll`
  - Clock-driven (3): `CountUp`, `Typewriter`, `Marquee`
  - State-aware (3): `Shake`, `Parallax`, `PageTransition`

  The skeleton-sweep wrapper is named `Shine` (slug `shine`) to avoid colliding with the
  existing AI `shimmer` streaming-text component — both keep their own registry slug.

  **Engine extensions**
  - `AnimateProps.filter` for blur (and any other CSS filter) animations
  - New `useTween(from, to, transition)` hook — numeric interpolator driven by the active `MotionConfig` clock; powers `<CountUp>` and is exported for consumers
  - Wrappers ship through the package barrel — `import { FadeIn } from "@hex-core/motion"`

  **Registry / MCP / CLI**
  - 26 motion items total (11 Phase 1 + 15 Phase 2). MCP `search_components(category:"motion")` now lists all of them.
  - Contract test pins every motion slug; renames or removals fail loudly in CI.
  - CLI `add <slug>` works unchanged — schema-only items install the npm peer and print next-step hints.

  **Recipe**
  - `landing-hero` — composes FadeIn / SlideIn / ScaleIn / Stagger / CountUp around `<Container>` / `<Stack>` / `<Button>`. Demonstrates the catalog without any custom Motion JSX.

  **Docs**
  - New `Catalog` section on `/docs/motion` linking each wrapper to its component page.
  - 15 live demos under `/docs/components/<slug>` — registered in `apps/docs/src/lib/demos.tsx`.
  - `hex-core-motion` SKILL.md gains a Catalog table for AI agent decision making.

  No breaking changes; Phase 1 surface (`Motion`, `Presence`, `<Timeline>`, `useAnimate`, etc.) is untouched.

### Patch Changes

- b28f8ee: fix(motion): emit `"use client"` banner so wrappers import cleanly into Server Components

  `tsup` strips per-file `"use client"` directives when bundling, so the published
  `dist/index.js` had no client marker — importing any wrapper (or `Motion`,
  `Presence`, the timeline) into a Next.js Server Component crashed with
  "createContext is not a function". `tsup`'s `banner.js` now re-applies
  `"use client"` to every emitted file, so `import { FadeIn } from "@hex-core/motion"`
  works directly in an RSC page without an explicit boundary.

  No source changes; surface unchanged. Fixes both Phase-1 and the new Phase-2 catalog.

## 0.2.0

### Minor Changes

- 398bc7d: feat(motion): introduce `@hex-core/motion` — UI animation primitives + deterministic timeline composer

  New top-level package inspired by Motion (motion.dev) for the React API and Hyperframes for the deterministic, agent-authorable timeline. Two layers, one package:
  1. **UI animation primitives** — `Motion.div/span/button/...` declarative factory, `<Presence>` for exit-aware unmounts, `useAnimate` imperative hook, `useMotionValue` / `useScroll` / `useInView`, `variants()`, `<MotionConfig>`. Honors `prefers-reduced-motion` automatically.
  2. **Timeline composer** — `<Timeline duration><Scene start duration><Clip target from to easing/></Scene></Timeline>`, imported from `@hex-core/motion/timeline`. Pure `composeTimeline()` resolver guarantees same JSX in → identical `ClipDescriptor[]` out. Pause / seek / resume map to WAAPI `pause()`/`currentTime=`/`play()`.
  3. **Optional Motion adapter** at `@hex-core/motion/adapters/motion`, peer-installs `motion@^11` for layout/FLIP and gestures (lazy import, friendly error if missing).

  **Engine**: zero peer-dep WAAPI core (`element.animate()`) with an injectable `Clock` for deterministic tests (`manualClock(0)`). Compositor-friendly props only (transform/opacity/color). Token-aware easings: `linear | standard | emphasized | decelerate | accelerate | bounce`.

  **Registry impact**: 11 new motion items (`motion`, `presence`, `transition`, `variants`, `use-animate`, `use-scroll`, `motion-timeline`, `scene`, `clip`, `track`, `motion-pro`). New `motion` value in `categoryEnum`. Build script (`scripts/build-registry.ts`) refactored to support schema-only roots — packages whose runtime ships from npm rather than copied source files. CLI `add motion` works without code changes; consumers get `pnpm add @hex-core/motion`.

  **MCP**: `search_components(category: "motion")` now valid. Contract tests pass unchanged.

  **Recipe**: new `intro-sequence` recipe demonstrates `motion-timeline` + `scene` + `clip` orchestrating existing primitives (`container`, `stack`, `button`).

  **Skill**: 9th SKILL.md (`hex-core-motion`) explains the decision tree (Motion vs MotionPro vs Timeline), token easings, and common mistakes.

  **Naming**: motion's timeline registry slug is `motion-timeline` (NOT `timeline`) so it doesn't collide with the existing chronological-event `timeline` component primitive.

  No breaking changes to existing packages.
