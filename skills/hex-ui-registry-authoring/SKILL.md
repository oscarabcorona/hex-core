---
name: hex-ui-registry-authoring
description: Authoring components, recipes, or a third-party hex-ui-compatible registry. Load when the user wants to add a new component, publish a registry, write a .recipe.ts file, or extend the hex-ui catalog.
---

# Hex UI — Registry Authoring

Two kinds of authoring: adding to the first-party registry (contributing), or publishing your own registry that follows the same shape.

## Component authoring — two files per component

```
packages/components/src/{category}/{name}/
  ├── {name}.tsx       # React + Tailwind + CVA + Radix
  └── {name}.schema.ts # Machine-readable contract
```

`{category}` is `primitives`, `components`, or `blocks`. After writing both files, run `pnpm run build:registry` to regenerate `registry/items/<name>.json` and the index.

### `.schema.ts` shape

```ts
import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const mySchema: ComponentSchemaDefinition = {
  name: "my-component",           // kebab-case slug
  displayName: "My Component",
  description: "One-sentence pitch.",
  category: "primitive",           // "primitive" | "component" | "block"
  subcategory: "actions",          // optional
  props: [
    { name: "variant", type: "enum", required: false, default: "default",
      description: "...", enumValues: ["default", "outlined"] },
    // ...
  ],
  variants: [
    { name: "variant", description: "Visual style", values: [...], default: "default" },
  ],
  slots: [
    { name: "children", description: "Content", required: true, acceptedTypes: ["ReactNode"] },
  ],
  dependencies: {
    npm: ["@radix-ui/react-X", "class-variance-authority"],
    internal: ["components/other/other"],   // file paths, translated to slugs at runtime
    peer: ["react", "react-dom"],
  },
  tokensUsed: ["primary", "ring"],
  examples: [
    { title: "Basic", description: "...", code: "<MyComponent />" },
  ],
  ai: {
    whenToUse: "...",
    whenNotToUse: "...",
    commonMistakes: ["..."],
    relatedComponents: ["other"],
    accessibilityNotes: "...",
    tokenBudget: 500,
  },
  tags: ["mine", "primitive"],
};
```

**Every `ai.*` field is mandatory.** The build fails if missing. `verify_checklist` derives agent warnings from `commonMistakes` and `accessibilityNotes`, so incomplete `ai` fields silently reduce quality.

### Token budget guideline

- Primitive (button, input, badge): 200–500
- Compound (card, form): 500–1000
- Block (data-table, calendar, sidebar): 1000–3000

Budget is for *the component's registry JSON* (source + schema), not runtime. Used by agents for context planning.

## Recipe authoring

```
packages/registry/src/recipes/<slug>.recipe.ts
```

```ts
import type { RecipeDefinition } from "@hex-core/registry";

export const myRecipe: RecipeDefinition = {
  slug: "dashboard-header",
  title: "Dashboard header",
  summary: "App-shell top bar with logo, nav, search, avatar menu.",
  tags: ["dashboard", "header", "navigation"],
  brief: "Build a dashboard header with logo, nav tabs, search, user menu.",
  steps: [
    { component: "navigation-menu", reason: "Primary nav", role: "primary" },
    { component: "input", reason: "Search box", role: "supporting" },
    { component: "avatar", reason: "User avatar trigger", role: "supporting" },
    { component: "dropdown-menu", reason: "Account menu", role: "supporting" },
    { component: "separator", reason: "Vertical divider", role: "optional" },
  ],
  checklist: [
    { id: "search-debounced", check: "Search input is debounced 250ms.",
      severity: "warn", source: "author" },
  ],
  tokenBudget: 2200,
};
```

**Rules:**
- `slug` must match `/^[a-z][a-z0-9-]*$/`.
- Every `steps[].component` must exist in the registry. Build fails otherwise.
- `brief` is the ground-truth test input — if `resolve_spec({brief})` doesn't return your recipe at #1, the recipe's discoverability is broken.
- `checklist[]` items with `source: "author"` are what you wrote; the build step auto-appends items lifted from each step component's `commonMistakes` and `accessibilityNotes` as `source: "derived-mistake"` / `"derived-a11y"`. Don't duplicate derived items manually.

## Third-party registry

If you ship your own component set:

1. Mirror the directory shape: `registry/items/<slug>.json`, `registry/recipes/<slug>.json`, `registry/registry.json` index.
2. Build your own MCP server or re-use `@hex-core/mcp` with your registry path overridden via `HEX_UI_REGISTRY_DIR` env var (TBD — follow `packages/payload/src/loaders/registry-loader.ts` for the candidate-path walker).
3. Namespace your component slugs (`acme-*`) to avoid collision with first-party.
4. Use the same `.ai` fields — `verify_checklist` and the resolver depend on them structurally.

## Common mistakes

- **Skipping the `tokenBudget` field.** It's optional at the schema level but expected by agents for context planning. Missing values degrade `resolve_spec` output.
- **Inventing slug characters.** `SLUG_REGEX` is `/^[a-z][a-z0-9-]*$/`. No uppercase, no underscores, no dots.
- **Forgetting to run `build:registry` after editing `.schema.ts`.** The JSON is the source of truth the MCP + CLI read. TypeScript file changes don't propagate until compiled.
- **Authoring a recipe whose `brief` doesn't make `resolve_spec` return it.** Self-test: run the brief through `resolve_spec` and confirm your slug is ranked #1.
- **Copying derived checklist items into the author list.** Build auto-derives from each step's `commonMistakes`; duplicating manually doubles them.
