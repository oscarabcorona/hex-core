---
"@hex-core/motion": minor
"@hex-core/registry": patch
"@hex-core/mcp": patch
---

feat(motion): Phase 2 popular-animation catalog — 15 wrappers + landing-hero recipe

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
