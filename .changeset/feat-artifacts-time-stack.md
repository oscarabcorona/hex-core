---
"@hex-core/components": minor
---

feat(artifacts): time-family diagram primitives — TimeAxis, Gantt, Sequence

Fourth and final batch of the initial `artifacts/` rollout, stacked on the relational stack. Adds the **time family** — diagrams whose subject is "what happened, when, and to whom".

- **`TimeAxis`** — events plotted along a horizontal time axis. Pure SVG, no peer. Accepts dates as `Date`, ISO string, or epoch ms. Auto-stacks colliding events into rows so labels never overlap. **Distinct from the existing event-list `<Timeline>` in `components/`** — TimeAxis encodes elapsed time as horizontal distance (the *gap* between events is the message), Timeline keeps event order without time-scaling.

- **`Gantt`** — tasks as horizontal bars across a time axis with optional dependency arrows and progress fills. Pure SVG, no peer. Supports the canonical `{ id, label, start, end, progress?, dependencies? }` shape. Use for project schedules, release plans, sprint boards, ETL job schedules.

- **`Sequence`** — UML-style sequence diagram. Actors as columns with vertical lifelines; messages as horizontal arrows in declaration order. Pure SVG, no peer. Supports `type: "sync" | "async" | "return"` and self-call loopback paths. Use for API request flows, distributed-system protocols, agent tool-call sequences.

**Naming choice:** the new time-axis primitive is `TimeAxis`, not `Timeline`, to avoid colliding with the existing event-list `<Timeline>` in `components/timeline`. Both ship side by side; the schemas explicitly call out the disambiguation in their `whenToUse` / `whenNotToUse`.

**Patterns shared with the prior stacks:**

- Layout pass memoized on input identity for all three primitives
- Every artifact emits `role="img"` + non-empty `<title>`/`<desc>`
- Interactive elements (TimeAxis events, Gantt task bars, Sequence actors + messages) declare `role="button"`, `tabIndex=0`, `aria-label`, and Enter/Space keyboard activation
- `data-row` / `data-depth` / `data-type` attributes for theming and test introspection

**Schemas:**

All three declare full `ai` blocks. The schemas' `commonMistakes` capture the locale-dependent date-string footgun, dependency-cycle warnings (Gantt), missing-id silent-skip behavior (all three), the elapsed-time-vs-order distinction (TimeAxis vs Timeline), and the sync/async/return arrow-style semantics (Sequence). All are lift-into-validation-ready for an LLM consumer.

Stacks on top of `feat/artifacts-relational-stack`. No new heavy peers and no registry/MCP changes — the `artifact` category enum was widened in the hierarchy stack and all subsequent stacks reuse that surface.
