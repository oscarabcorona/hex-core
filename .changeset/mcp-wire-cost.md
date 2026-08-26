---
"@hex-core/mcp": minor
"@hex-core/payload": minor
"@hex-core/cli": patch
---

Stop shipping whole graph nodes over the MCP wire.

`query_graph explain button` cost 16,429 tokens — 8 % of a 200K context for
one call — because each neighbour embedded the entire far-end graph node,
`exports` and `exportPaths` included, plus an edge whose `source`/`target`
merely restated the two slugs already present. Neighbours are now projected
to the six fields a caller acts on: 3,181 tokens, and every hub drops 73–81 %.
`neighbors` mode returns `{total, neighbors}` so a capped result says it was
capped.

`search_components` was unbounded. Called with no arguments — how an agent
enumerates the catalog — it returned all 187 summaries at 24,018 tokens. It
now pages at 20 and returns `{total, returned, results}`; pass `limit` (max
200) for more. Its matcher also treated the query as a substring, so `"and"`
matched `command`; it now matches word prefixes, so `"butt"` still finds
`button` and `"and"` does not.

Both surfaces, plus `search_compositions`, `resolve_spec` and
`map_application`, now have token ceilings in the contract test. None of them
had one before, which is why neither cost was noticed.

`resolveSpec` read the full item JSON for every candidate scoring above zero —
133 of 187 items for a ten-token brief — before slicing to eight. The read
moved past the slice; output is unchanged. `loadRecipes`, `listThemes` and the
POC export index are memoised, and `hex add` no longer re-reads the same item
from three call sites.

`@hex-core/payload` gains a `wordSet` export (the matcher `search_components`
now shares) and a named `ThemeSummary` type for `listThemes`.
