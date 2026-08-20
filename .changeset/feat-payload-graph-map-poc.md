---
"@hex-core/payload": minor
---

Catalog graph engine + application map + POC builders. `parseGraph`/`loadGraph` load the new `registry/graph.json` (items + recipes + theme presets; `requires`/`composes`/`themes`/`related`/`instead-use` edges, curated communities, hub detection); pure query functions (`explainNode`, `neighbors`, `requiresClosure`, `affected`, `shortestPath`) back `hex graph` and MCP `query_graph`. `buildApplicationMap`/`mapFromRecipe` deterministically map a whole-application brief onto screens + a requires-closure install manifest (`hex.map.json`, zod `mapSchema`). `buildPocFiles`/`generatePageSource` emit the complete file tree of a standalone runnable Next.js demo app from a map, with known-good dependency pins and imports rewritten via the relocated `rewriteRegistryImports` (now exported here as the single shared implementation).

`buildPocFiles` also repoints block-example image references at a bundled `public/placeholder.svg`, emits a `<main>` landmark on generated routes, pins first-party `@hex-core/*` dependencies (guarded by a new pin-coverage test), and writes a map whose install list matches the app it generated. `parseGraph` / `parseMap` check the format `version` before schema validation so a newer artifact produces an upgrade message rather than a bare literal error.
