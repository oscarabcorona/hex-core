---
"@hex-core/components": minor
---

feat(artifacts): flow-family diagram primitives — Sankey, Funnel, Pyramid, Flowchart

Second batch in the `artifacts/` category. The hierarchy core (MindMap / TreeMap / OrgChart / Sunburst / Dendrogram) shipped first; this batch adds the **flow family**:

- **`Sankey`** — weighted-flow diagram via `d3-sankey` (~6 KB gzip optional peer). Nodes arrange in horizontal columns by topological depth; link thickness encodes flow value. Use for energy/material/money flows, marketing-funnel transitions, traffic referral flows.

- **`Funnel`** — vertical stack of trapezoidal stages whose width is proportional to each stage's value. Pure SVG, no peer. Renders stage-to-stage conversion percentages by default. Use for monotonic conversion drop-off (signup, sales pipeline, ETL row counts).

- **`Pyramid`** — ranked-tier pyramid with `widening` or `narrowing` shape. Pure SVG, no peer. **Distinct from Funnel**: Pyramid encodes RANK (each tier is a distinct level), Funnel encodes FLOW (subset + conversion ratio). Use for Maslow-style hierarchies, organizational tiers, content hierarchies.

- **`Flowchart`** — typed React flowchart with topological-rank auto-layout. Nodes support `shape: "rect" | "round" | "diamond"` for terminal markers and decision nodes. Edges support optional `label`. Pure SVG, no peer. Distinct from `<Diagram>` (Mermaid string DSL) and `<Canvas>` (free-form ReactFlow) — Flowchart is the right choice when you have STRUCTURED data and want a polished SVG without a heavy peer.

**Heavy peer (Sankey only):**

- `d3-sankey@^0.12.3` (~6 KB gzip) declared as optional peer in `@hex-core/components`. CLI's `hex add sankey` prompts before installing. Funnel, Pyramid, and Flowchart need no install.

**Patterns:**

- Sankey follows the lazy-import + placeholder-div pattern used by the hierarchy stack
- Funnel/Pyramid/Flowchart render synchronously since they're pure SVG
- Every artifact emits `role="img"` + non-empty `<title>`/`<desc>` for screen readers
- Interactive nodes/segments/stages/tiers carry `data-depth` / `data-rank` / `data-shape` attributes so consumers can theme depth bands or shape variants from CSS without re-implementing the palette

**Schemas:**

All four declare full `ai` blocks (`whenToUse`, `whenNotToUse`, `commonMistakes`, `relatedComponents`, `accessibilityNotes`, `tokenBudget`) and the schemas explicitly call out the Pyramid-vs-Funnel and Flowchart-vs-Diagram-vs-Canvas distinctions so an LLM picking between them can make the right call.

Stacks on top of `feat/artifacts-hierarchy-stack` — both PRs merge into the same `artifacts/` category surface.
