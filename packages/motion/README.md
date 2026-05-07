# @hex-core/motion

[![npm](https://img.shields.io/npm/v/@hex-core/motion.svg)](https://www.npmjs.com/package/@hex-core/motion)
[![downloads](https://img.shields.io/npm/dm/@hex-core/motion.svg)](https://www.npmjs.com/package/@hex-core/motion)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

UI animation primitives + a lightweight scene/timeline composer for Hex Core.

- **Zero-dep core** — CSS variables + Web Animations API (`element.animate`).
- **Optional `motion@^11` adapter** — opt-in via `@hex-core/motion/adapters/motion` for layout animations and gestures.
- **Deterministic timeline** — agent-authorable `<Timeline>/<Scene>/<Clip>` composer where same input renders identically.
- **Data-attribute opt-in** — `data-hex-motion="fade-in;dur:200"` for non-React surfaces.

## Install

```bash
pnpm add @hex-core/motion
# Optional, only if you import @hex-core/motion/adapters/motion:
pnpm add motion
```

## Quick start

```tsx
import { Motion, Presence } from "@hex-core/motion";

<Presence>
  {open && (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 200, easing: "standard" }}
    />
  )}
</Presence>
```

## Timeline

```tsx
import { Timeline, Scene, Clip } from "@hex-core/motion/timeline";

<Timeline duration={2000} autoPlay>
  <Scene start={0} duration={800}>
    <Clip target="#title" from={{ opacity: 0 }} to={{ opacity: 1 }} />
  </Scene>
  <Scene start={600} duration={1400}>
    <Clip target="#cta" from={{ y: 24 }} to={{ y: 0 }} easing="emphasized" />
  </Scene>
</Timeline>
```

## Adapter (optional)

```tsx
import { MotionPro, PresencePro } from "@hex-core/motion/adapters/motion";
```

Throws `MotionAdapterMissingError` with install instructions if `motion` isn't installed.
