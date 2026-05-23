---
"@hex-core/registry": minor
"@hex-core/cli": minor
---

refactor(recipes)!: rename the `app-shell` recipe to `layout-starter`

The new `app-shell` **block** (an application layout frame) takes the canonical
`app-shell` slug, so the legacy `app-shell` **recipe** — which is really a bundle
of twelve layout primitives — is renamed to `layout-starter`. This keeps slug
discovery (CLI `hex add` / `hex recipe add` and MCP `get_component` /
`get_recipe`) unambiguous: "app shell" now resolves to the component an agent
expects, and the primitives bundle reads as what it is.

Breaking: `hex recipe add app-shell` is now `hex recipe add layout-starter`.
