---
"@hex-core/cli": minor
---

Agent-builder commands: `hex map` (deterministic brief → screens/install/warnings map, `--out hex.map.json`), `hex poc` (scaffold a standalone runnable Next.js demo app from a brief, map, or page recipe), and `hex graph explain|affected|neighbors|path` (query the shipped catalog knowledge graph; mirrors MCP `query_graph`'s four modes). `hex add --from` now also accepts a `hex.map.json` application map; `hex doctor` verifies the bundled catalog graph.

Note: the CLI now depends on `@hex-core/payload`, which vendors its own copy of the registry. An `npx @hex-core/cli` install therefore carries two registry snapshots (~2x unpacked size). This is a deliberate trade for a single shared engine across CLI and MCP — the CLI injects its own snapshot into every payload entry point, so the two can never skew.
