---
name: hex-core-recipes-workflow
description: End-to-end spec-driven flow for hex-core. Load when the user asks to build a login form, settings page, pricing table, data table, confirmation dialog, command palette, or any multi-component layout from a brief.
---

# Hex Core — Spec-Driven Workflow

When a user hands you a brief ("build me a settings page with profile + notifications + security sections"), don't go straight to components. Walk this pipeline.

## The four steps

```
Brief
  ↓  resolve_spec
Ranked recipes + components
  ↓  get_recipe (if recipe wins)
Ordered install steps + checklist
  ↓  hex recipe add <slug>     (or: MCP get_component for each + Write)
Files in components/ui/
  ↓  verify_checklist
Pass / missing deps / a11y reminders
```

## Step 1: Resolve

```ts
resolve_spec({ brief: "build me a settings page with notifications toggle" })
```

Returns a ranked list of **recipes** (top 4) and **components** (top 8). Scoring is deterministic — keyword + tag matching against every component's `.ai.whenToUse` and each recipe's `slug`, `tags`, `title`, `summary`. No LLM call server-side.

**How to read the result:**
- Recipe score > 10 = strong match, proceed to `get_recipe`
- Recipe score 4–8 = tied with filler-word noise; probably no good recipe match
- Recipe score 0 or all tied at low floor = no recipe, use component-level

## Step 2: Get the recipe

```ts
get_recipe({ slug: "settings-page" })
```

Returns:
- `steps[]` — ordered component slugs + per-step `reason` + `role` (primary/supporting/optional)
- `install.componentCommand` — the literal `hex add ...` command
- `install.npmDependencies` — union of every step's npm peer deps
- `checklist[]` — author-written items (severity: blocker / warn / nit) plus derived items lifted from each step component's `commonMistakes` and `accessibilityNotes`

Walk the checklist. Blocker items are load-bearing; warn items are strong recommendations; nit items are polish.

## Step 3: Install

Two paths:

**(a) CLI (preferred when a shell is available):**
```bash
hex recipe add settings-page
```
Runs `hex add` for every step in order. Transitive internal deps install automatically.

**(b) MCP (when scripting from the agent):**
```ts
for (const step of recipe.steps) {
  const item = await get_component({ name: step.component });
  // Write item.files[0].content to `components/ui/<slug>.tsx`
}
```
Remember to write `lib/utils.ts` once (shared by every component).

## Step 4: Verify

```ts
verify_checklist({
  components: recipe.steps.map(s => s.component),
  recipe: "settings-page",
  projectRoot: "/abs/path/to/project"  // optional; enables file-presence scan
})
```

Returns:
- `ok: boolean`
- `missingInternalDeps[]` — a component imports `./popover` but popover.tsx isn't in the project
- `files.{ present, missing }` — when `projectRoot` supplied
- `checklist[]` — the recipe's items, re-surfaced for the agent to walk

If `ok: false`, fix the missing deps (just run `hex add <missing-slugs>`) before declaring done.

## What if no recipe matches?

`resolve_spec` returned components but no strong recipe. Proceed at the component level:

1. Read the top 3–5 components' `whenToUse` / `whenNotToUse` from the result.
2. Check `relatedComponents` — sibling primitives the agent often forgets.
3. Call `get_component_schema` (not the full `get_component`) for the ones you're using to save tokens.
4. Install via `hex add slug1 slug2 ...` — transitive deps auto-resolve.
5. `verify_checklist` still works without a recipe argument; it catches missing internal deps.

## Anti-patterns

- **Skipping `resolve_spec`.** Agents that go straight to `search_components` miss recipe hits.
- **Ignoring `whenNotToUse`.** This field exists because the top-ranked component is often *not* the right one in context.
- **Not running `verify_checklist`.** Agents declare done, user discovers broken import at compile time.
- **Inventing recipe slugs.** If `get_recipe` returns "not found", do not retry with a plural / synonym. Call `list_recipes` to see what exists.

## Example — full chain

```
User: "I need a login page with email + password and 'remember me'."

Agent:
→ resolve_spec({brief: "login page with email, password, remember me"})
  → top recipe: auth-form (score 18)

→ get_recipe({slug: "auth-form"})
  → steps: [form, label, input, checkbox, button, alert]
  → blocker checklist: password field needs type='password' + autoComplete='current-password'

→ hex recipe add auth-form   (shell)
  → writes 6 components + lib/utils.ts + prints full checklist

→ verify_checklist({components: [...], recipe: "auth-form", projectRoot: "/proj"})
  → ok: true, files.missing: []

Done.
```
