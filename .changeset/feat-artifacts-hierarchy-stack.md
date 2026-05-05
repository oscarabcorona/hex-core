---
"@hex-core/components": minor
"@hex-core/registry": minor
"@hex-core/mcp": patch
---

feat(artifacts): hierarchy-family diagram primitives — MindMap, TreeMap, OrgChart, Sunburst, Dendrogram

Introduces a new `artifacts/` top-level category for typed React diagram primitives. This batch ships the **hierarchy core** — five primitives that all share a single small optional peer (`d3-hierarchy`, ~3 KB gzip), with Sunburst additionally using `d3-shape` for arc paths.

**New components (`@hex-core/components`):**

- **`MindMap`** — typed React mind map with radial or horizontal layout. Pass a hierarchical `root` node; the component lays out children using d3-hierarchy's tree layout. No Mermaid string DSL required.
- **`TreeMap`** — squarified treemap where each leaf's area is proportional to its `value`. Supports `tile: "squarify" | "binary" | "slice-dice"` and depth- or value-based coloring.
- **`OrgChart`** — top-down organizational chart with collapsible subtrees. Each node renders as a rounded card; click any node with children to fold its subtree behind a `+N` badge. Supports `defaultExpandedDepth` for initial state.
- **`Sunburst`** — radial hierarchy by value with click-to-zoom drill-down. Each ring is a deeper level of the tree; segment angles are proportional to summed values. Click the center to zoom back out.
- **`Dendrogram`** — clustering tree where every leaf sits at the same depth (the visual signature of taxonomies, phylogenetic trees, hierarchical-clustering output). Supports horizontal/vertical orientation and step/diagonal links.

All five follow the established heavy-peer pattern from `Canvas` / `Diagram`:

- Lazy `import("d3-hierarchy")` on mount; placeholder `<div data-hex-<name>-loading />` until resolution
- Optional peer dependency with `peerDependenciesMeta.optional: true`
- CLI's `hex add <name>` flow prompts before installing the d3 modules
- Typed React-prop API (no string DSL) so consumers can drive the diagram from application state
- SVG output with `role="img"` + `<title>` + `<desc>` for screen readers

**Schema (`@hex-core/registry`):**

- `categoryEnum` gains a new `"artifact"` value alongside the existing `"primitive" | "component" | "block" | "ai" | …` set.
- `internalDepToSlug` now accepts `"artifacts/…"` paths in addition to `components/`, `primitives/`, and `blocks/`.

**MCP server (`@hex-core/mcp`):**

- The `search_components` tool's `category` filter enum now matches the registry enum (adds `"artifact"`). Without this, `search_components({ category: "artifact" })` would reject at the Zod boundary even though the items exist in the registry.

**Where to place them:**

`packages/components/src/artifacts/` — a new top-level category sibling to `primitives/`, `components/`, and `ai/`. Keeps general-purpose visualizations out of the `ai/` folder (whose schemas are tuned for agent-output semantics) and gives the next batches (Flow, Relational, Time) a natural home.
