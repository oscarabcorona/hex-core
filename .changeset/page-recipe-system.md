---
"@hex-core/registry": minor
"@hex-core/payload": minor
"@hex-core/mcp": minor
"@hex-core/cli": minor
---

feat(recipes): page-recipe system foundation

Recipes can now describe whole pages, not just component bundles. A recipe
gains an optional `kind` (`component` — the default and every existing recipe,
or `page`), plus page-only fields: `pageType` (`landing` | `app` | `ecommerce`),
a recommended `theme` (token preset + whole-page token budget), an ordered
`sections` list (each a section block with an `intent`), and a `layout` brief.

- `build-registry` validates section blocks against the catalog and derives
  checklist items from their `ai` metadata, same as component steps.
- MCP `get_recipe` returns the full page spec in one call; `list_recipes`
  surfaces `kind`/`pageType` so an LLM can find the page recipe for a request.
- CLI `hex recipe add <page>` installs the section blocks in order and surfaces
  the recommended theme + layout. `hex recipe list` tags page recipes.

Fully backward-compatible — every existing recipe still validates and installs
unchanged.
