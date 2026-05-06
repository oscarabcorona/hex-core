---
name: hex-core-theming
description: How to theme hex-core components. Load when the user asks about colors, dark mode, brand palette, CSS variables, design tokens, theme customization, @hex-core/tokens, or theme overrides.
---

# Hex Core — Theming

Hex Core uses HSL CSS variables as Tailwind theme tokens. Three themes ship: `default` (neutral), `midnight` (deep blue, dev-tool feel), `ember` (warm terracotta).

## Token model

Every component reads from HSL CSS variables:
```css
--background / --foreground
--primary / --primary-foreground
--secondary / --secondary-foreground
--muted / --muted-foreground
--accent / --accent-foreground
--destructive / --destructive-foreground
--border / --input / --ring
--radius  (e.g. 0.5rem)
```

Each variable holds **HSL values as a triplet string** (e.g. `240 5.9% 10%`), not `hsl(...)`. The Tailwind utility wraps with `hsl(var(--primary))`.

## Dark mode

Flips via `.dark` class on `<html>` (handled by `next-themes` in the docs). The same variable name is present in both light and dark scopes; the value differs. No media queries — explicit class control.

## Getting theme tokens via MCP

```ts
get_theme({ name: "midnight", format: "css" })     // globals.css block, paste into app
get_theme({ name: "midnight", format: "json" })    // flat { "--primary": "...", ... } — token-efficient for AI
get_theme({ name: "midnight", format: "tailwind" })// tailwind.config.ts extend block
get_theme({ name: "midnight", format: "json", mode: "dark" })  // pick mode explicitly
```

## Overriding tokens

Two ways:

**(1) Edit `app/globals.css` directly.** Standard for one-off brand color swaps. Hex Core components don't care about the token *name* — they just read `var(--primary)`.

**(2) Use `customize_component` for per-component overrides via MCP:**
```ts
customize_component({
  name: "button",
  cssOverrides: {
    "--primary": { light: "220 90% 56%", dark: "220 80% 66%" }
  }
})
```
Returns the component JSON with a `cssVariables` key the agent can inject into scope.

## Adding a new theme

Option A — fork a theme in `@hex-core/tokens/src/themes/` and export it alongside the existing three. The MCP `get_theme` walks `listThemes()` so anything exported shows up automatically.

Option B — user-side: define your own `:root { --primary: ...; }` in `globals.css`. Hex Core doesn't care where the variables come from — it just consumes them.

## Border radius

`--radius` is a single root token. Individual component corners derive:
- `rounded-lg` → `calc(var(--radius))`
- `rounded-md` → `calc(var(--radius) - 2px)`
- `rounded-sm` → `calc(var(--radius) - 4px)`

To change global roundedness, set `--radius` once in your globals. Don't patch the `rounded-*` utilities.

## Common mistakes

- **Using `hsl()` inside the variable value.** `--primary: hsl(240 5.9% 10%)` is wrong. The variable holds raw HSL components (`240 5.9% 10%`) and Tailwind wraps with `hsl(var(--primary))`.
- **Assuming the dark scope lives in `@media (prefers-color-scheme: dark)`.** It doesn't — dark variables live under `.dark { ... }`. The selector is class-based.
- **Adding colors outside the token system.** If a color needs `primary-focus`, `primary-hover`, etc., add them as new tokens in globals.css, not as one-off Tailwind colors. Keeps dark mode automatic.
- **Forgetting that `--radius` is a token.** Hardcoding `rounded-[6px]` in a component means the theme can't adjust it globally.

## WCAG + contrast

The three shipped themes pass WCAG AA on `background` ↔ `foreground` and `primary` ↔ `primary-foreground` pairs. If you fork a theme, re-check those pairs — the CLI doesn't enforce it.
