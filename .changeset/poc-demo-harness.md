---
"@hex-core/payload": minor
---

`hex poc` now scaffolds a demo, not just frames. A POC is the frames *demoed* — without a way to reach the states that matter, a reviewer only ever sees one screenshot's worth of the product, and the states where a design actually fails stay invisible.

Every generated app ships a floating demo panel (`components/demo-controls.tsx`) holding both controls in one surface:

- **Viewing as** — re-renders every frame as `viewer`, `member` or `admin`. Frames gated on a capability say why they are unavailable instead of 404ing; `settings-page` recipes gate on `seeSettings`.
- **Data** — flips every frame between its populated and empty state.

Both live in cookies rather than query params, so a selection survives navigation instead of being a deep link. Generated pages became `async`, read `getDemoContext()`, and render the `empty` primitive when the panel asks for it. The vocabulary in `lib/demo.ts` is deliberately generic and meant to be extended — add roles, add capabilities, and scope real data through `can` rather than through the role name.

`empty` and `select` join every install closure so the panel and the frames' empty states resolve even when the brief mapped neither. The scaffold also sets `devIndicators: false`, since Next's dev bubble sits on top of app chrome in exactly the screenshots a POC exists to produce.
