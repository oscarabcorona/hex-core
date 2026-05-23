# @hex-core/motion

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
