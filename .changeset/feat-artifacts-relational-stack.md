---
"@hex-core/components": minor
---

feat(artifacts): relational-family diagram primitives — Venn, Chord, Arc, Matrix

Third batch in the `artifacts/` category, stacked on the flow stack. Adds the **relational family** — diagrams whose subject is the relationships *between* entities rather than a hierarchy or directional flow.

- **`Venn`** — set-overlap diagram for 2 or 3 sets. Pure SVG, no peer. Renders a friendly fallback for unsupported set counts (>3 / 0). Use for categorical overlap (Linux ∩ Mac ∩ Windows) — explicitly NOT for area-correct intersection cardinality (that's Euler-diagram territory).

- **`Chord`** — circular-relationship diagram via `d3-chord` (~3 KB gzip optional peer) + `d3-shape` (already a peer). Nodes form a ring; ribbons inside encode weighted bidirectional relationships. Use for trade flows, migration corridors, citation networks. Distinct from Sankey — Sankey requires a left-to-right flow direction; Chord is direction-agnostic on a ring.

- **`Arc`** — diagram where nodes lie on a horizontal baseline and relationships are drawn as semicircle arcs above. Pure SVG, no peer. Use when node ORDER is meaningful (sequence-aware data: chapter co-occurrence, transit transfer points, citation chronology). Distinct from Chord — Chord = ring (no order), Arc = baseline (order matters).

- **`Matrix`** — adjacency matrix where cell (row i, col j) encodes the relationship from node i to node j by color intensity. Pure SVG, no peer. Best for dense graphs that turn into hairballs in node-link form (~100 nodes scales gracefully). Use for confusion matrices, correlation matrices, trade-flow matrices.

**Heavy peer (Chord only):**

- `d3-chord@^0.12.x` declared as optional peer (~3 KB gzip). The CLI's `hex add chord` flow prompts before installing. Venn, Arc, Matrix need no install.

**Patterns shared with hierarchy + flow stacks:**

- Lazy-import + placeholder-div for Chord (heavy peer)
- Layout pass memoized on input identity for all four primitives
- Every artifact emits `role="img"` + non-empty `<title>`/`<desc>`
- Interactive nodes/cells/sets/ribbons declare `role="button"`, `tabIndex=0`, `aria-label`, and Enter/Space keyboard activation
- `data-depth` / `data-row` / `data-col` attributes for theming and test introspection

**Schemas:**

All four declare full `ai` blocks and explicitly call out the disambiguating distinctions: Venn-vs-Euler (area correctness), Chord-vs-Arc (ring vs baseline order), Matrix-vs-Sankey (dense vs flow), Matrix-vs-Chord (scale vs aesthetic).

Stacks on top of `feat/artifacts-flow-stack`. No new registry/MCP changes — the hierarchy stack already widened the `artifact` category enum across both packages; Flow and Relational reuse that surface.
