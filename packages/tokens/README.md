# @hex-core/tokens

[![npm](https://img.shields.io/npm/v/@hex-core/tokens.svg)](https://www.npmjs.com/package/@hex-core/tokens)
[![downloads](https://img.shields.io/npm/dm/@hex-core/tokens.svg)](https://www.npmjs.com/package/@hex-core/tokens)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

Design token engine for Hex UI — HSL color tokens + typography scale + shadow/radius tokens shared between components and themes.

## Install

```bash
pnpm add @hex-core/tokens
```

Or, more commonly, copy the CSS block from the [Theming guide](https://hex-core.dev/docs/theming) directly into your app's `globals.css`.

## Contents

- Light + dark HSL palette (zinc neutral base, WCAG-safe pairs)
- Typography scale (`--text-2xs` → `--text-5xl`)
- Radii (`--radius-sm/md/lg`)
- Shadows (`--shadow-glow`)
- Container widths

## CSS variable namespaces

Tokens live in **two namespaces** depending on which layer is reading them. Knowing the contract avoids surprises when you author `globals.css`, override at runtime, or wire Tailwind v4.

### `--<key>` — raw values, key-only namespace (source of truth)

`themeToCss(theme)` emits CSS custom properties using the **raw value verbatim**, with no `hsl()` wrapper and no `--color-` prefix. The exact shape of the value depends on the token type — colors are stored as H S L triplets in the bundled themes, radii as lengths, durations as times, etc. `themeToCss` doesn't transform the value; it just writes it under `--<key>`.

```css
@layer base {
  :root {
    --background: 0 0% 100%;       /* color, stored as triplet */
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --radius-md: 0.5rem;            /* length */
    --duration-fast: 150ms;         /* time */
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* … */
  }
}
```

**Why store colors as triplets:** alpha composition. `hsl(var(--background) / 0.5)` requires the var to hold `0 0% 100%`, not `hsl(0 0% 100%)`. Utilities like `bg-background/50` and ring/border opacity overrides depend on this — wrapping at the source forfeits them.

`themeToFlatJson()` shares this namespace (returns `Record<"--<key>", string>` for AI/LLM consumption).

### `--color-<key>` — Tailwind v4 `@theme` (consumption)

Tailwind v4's `@theme` directive demands a `--color-<key>` namespace to auto-generate utilities like `bg-background`, `text-foreground`, `border-input`. The docs site authors this layer **by hand** in `apps/docs/src/app/globals.css`:

```css
@theme {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(240 10% 3.9%);
  --color-primary: hsl(240 5.9% 10%);
}

.dark {
  --color-background: hsl(240 10% 3.9%);
  /* … */
}
```

This shape has the `hsl()` wrapper and the `--color-` prefix — different from the raw layer.

### Bridging both layers (recommended for v4 consumers)

If you want **one source of truth** plus Tailwind v4 utilities, declare the raw values at `:root`/`.dark` and delegate from `@theme`:

```css
@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  /* … */
}

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
}
```

Now your runtime overrides (`.theme-vivid { --background: 270 100% 95%; }`) only need to touch the raw layer — Tailwind utilities follow automatically because `@theme` resolves `var(--<key>)` at paint time.

> **Use plain `@theme`, not `@theme inline`.** The `inline` form substitutes the value at build time and would freeze the `var(--<key>)` lookup to whatever the variable resolved to during build, breaking the bridge. The non-color tokens in the docs site use `@theme inline` deliberately because they're static (radii, font sizes); colors stay in plain `@theme` so the cascade works.

The docs site itself doesn't bridge — it inlines `hsl(...)` directly in `@theme` and re-declares colors in `.dark`. That's intentional: the docs app never round-trips through `themeToCss`, so a separate raw layer would just be duplication. **Bridge when** you ship to v4 consumers AND you need them to override raw values in custom themes (`.theme-foo { --background: ... }`).

### Tailwind v3 helper

`themeToTailwindConfig(theme)` returns the same Tailwind layer for the **v3 config-file** style:

```ts
import { defaultTheme, themeToTailwindConfig } from "@hex-core/tokens";

export default {
  theme: { extend: themeToTailwindConfig(defaultTheme) },
};
```

Output uses `hsl(var(--<key>))` references (no `--color-` prefix needed in v3).

> `generateGlobalsCss` is also Tailwind v3 — it wraps `themeToCss` output with `@tailwind base/components/utilities` directives. Don't use it inside a Tailwind v4 project.

## Overriding

Every token is a CSS custom property. Override on `:root` or inside `.dark` for per-theme overrides. See the [Theming guide](https://hex-core.dev/docs/theming) for examples (accent hue swap, custom palette, typography scale).

## Docs

[hex-core.dev/docs/theming](https://hex-core.dev/docs/theming)

## License

MIT
