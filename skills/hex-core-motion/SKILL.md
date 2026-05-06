---
name: hex-core-motion
description: Hex Core motion primer. Load when the user asks to animate UI, build sequences, replicate Framer Motion / Motion patterns, set up scroll-driven animations, orchestrate multi-step transitions, or compose intro/outro reveals using @hex-core/motion.
---

# Hex Core — Motion

`@hex-core/motion` is the animation surface for Hex Core. Two layers, one package:

1. **Motion primitives** — declarative React (`Motion.*`, `Presence`), imperative (`useAnimate`), reactive scalars (`useMotionValue`, `useScroll`).
2. **Timeline composer** — `<Timeline>/<Scene>/<Clip>` for deterministic multi-step UI sequences. Imports from the `/timeline` subpath.

Optional adapter at `/adapters/motion` lazily wraps `motion@^11` for layout/FLIP and gestures.

## Mental model

- **Driver = WAAPI** (`element.animate`). The core is zero-dep.
- **Clock is injectable.** `realtimeClock` (rAF) by default, `manualClock(0)` for tests so seek is deterministic.
- **`prefers-reduced-motion` is honored everywhere** — `MotionConfig reducedMotion="never"` opts out (use only for screenshot tests, never in production UX).
- **Timeline determinism**: `composeTimeline(node)` is pure. Same JSX in → identical `ClipDescriptor[]` out. Seek = re-issue WAAPI animations with `delay = clip.t0 - currentT`. A snapshot at any `t` is reproducible.

## Decision: which export do I reach for?

| Need | Use |
|---|---|
| Mount/unmount fade, hover lift, tap squeeze | `Motion.div` + `Presence` |
| Imperative chain from a click handler | `useAnimate` (await `.finished` between steps) |
| Scroll progress bar / parallax | `useScroll` + `useMotionValueRender` |
| Visibility-triggered animations | `useInView({ once: true })` |
| Open/closed dialog with named states | `variants({ open, closed })` + `Motion.div animate="open"` |
| Multi-step intro sequence (3+ moves) | `<Timeline>/<Scene>/<Clip>` from `@hex-core/motion/timeline` |
| Layout transitions, drag, shared element | `motion-pro` adapter (`@hex-core/motion/adapters/motion`) — peer-installs `motion@^11` |
| Non-React HTML opt-in | `data-hex-motion="fade-in;dur:200;easing:standard"` |

If you find yourself reaching for raw CSS keyframes or `setTimeout` to chain animations: stop. Use `useAnimate` or `<Timeline>`.

## Tokens

`transition.easing` accepts named tokens — **always prefer these over inline cubic-beziers** so a theme swap propagates:

- `linear`, `standard`, `emphasized`, `decelerate`, `accelerate`, `bounce`

Durations are plain ms numbers. Token values from `@hex-core/tokens`: `duration-fast` (~120), `duration-normal` (~200), `duration-slow` (~300).

## What this is NOT

- **Not a video framework.** Hyperframes + Remotion render HTML to MP4 via FFmpeg. `@hex-core/motion` only animates UI in the browser.
- **Not a physics engine.** `springToBezier` is an approximation; for true spring physics use the `motion-pro` adapter.
- **Not for layout transitions** (FLIP, shared-element). The core driver only animates compositor-friendly props (transform, opacity, color). Layout = adapter.

## Common mistakes (auto-flagged by MCP)

- Animating layout-affecting props (`width`, `height`, `margin`) — kills compositor performance. Animate `transform` instead.
- Forgetting `<Presence>` around conditional `Motion.div` — exit animations never run.
- Forgetting `key` on Presence children — adds/removes can't be tracked.
- Targeting selectors in `<Clip target="#x">` that don't exist yet — clips silently no-op.
- Mixing `useAnimate` and `<Timeline>` on the same element — one driver should own a target.
- Defining `variants` inline in render — every render re-runs animations. Hoist or memoize.

## Catalog (Phase 2)

15 popular-animation wrappers ship as registry items. Reach for these before hand-writing `<Motion.div initial animate>` for the Nth time:

| Slug | Use case |
|---|---|
| `fade-in` | Opacity 0 → 1, smallest possible Motion wrapper. |
| `slide-in` | Direction-aware slide (top/right/bottom/left). |
| `scale-in` | Scale 0.95 → 1 + opacity. Modals, toasts, primary CTAs. |
| `blur-in` | filter:blur(N) → blur(0). Cinematic hero focus-pull. |
| `pulse` | Infinite scale pulse. Notification dots, hint buttons. |
| `bounce` | Mount-time overshoot. Toasts, achievements. |
| `shimmer` | Skeleton-loader gradient sweep. |
| `stagger` | Cascade orchestrator — injects per-child `delay` prop. |
| `reveal-on-scroll` | Fade + slide-up on first viewport intersection. |
| `count-up` | Numeric tween with pluggable formatter. |
| `typewriter` | Character-by-character text reveal. |
| `marquee` | Infinite seamless scroller (logos, tickers). |
| `shake` | Trigger-driven horizontal jitter for error feedback. |
| `parallax` | Scroll-driven translate. |
| `page-transition` | Keyed Presence + Motion for route changes. |

Each accepts named easings, has `prefers-reduced-motion` baked in, and uses the same WAAPI engine as `<Motion>`. Compose Stagger + FadeIn for cascading list reveals; compose RevealOnScroll + Stagger for visibility-triggered cascades.

## Recipes

- **`intro-sequence`** (Phase 1) — hero reveal via the timeline composer.
- **`landing-hero`** (Phase 2) — uses the catalog: FadeIn headline + SlideIn subhead + ScaleIn CTA + CountUp stats. Lists in `npx @hex-core/cli recipe list`.

## Where to go next

- Building a multi-step UI sequence? Start from `motion-timeline`, add `scene` and `clip` schemas to your scaffold.
- Need layout/drag? `npx @hex-core/cli add motion-pro`, then `pnpm add motion`.
- Verifying agent UX? Load `hex-core-mcp-tools` for the tool decision tree; motion items are surfaced via `search_components(category: "motion")`.
