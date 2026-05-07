# @hex-core/motion

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
