# @hex-core/themes

[![npm](https://img.shields.io/npm/v/@hex-core/themes.svg)](https://www.npmjs.com/package/@hex-core/themes)
[![downloads](https://img.shields.io/npm/dm/@hex-core/themes.svg)](https://www.npmjs.com/package/@hex-core/themes)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

Premium theme catalog for Hex UI — preset palettes that consume the same `Theme` shape as `@hex-core/tokens`.

## Why this is its own package

`@hex-core/tokens` keeps a single canonical default theme + the transformer functions (`themeToCss`, `themeToScopedRuntimeCss`, etc.). `@hex-core/themes` is the publish/version surface for everything else. Adding or revising a theme bumps **only** this package, so consumers who pin a theme don't get pulled forward by an unrelated transformer change.

## Install

```bash
pnpm add @hex-core/themes @hex-core/tokens
```

`@hex-core/tokens` is the implicit peer dep — every theme is a `Theme` instance from `@hex-core/registry`, applied by `tokens`' transformers.

## Use

```ts
import { midnightTheme, emberTheme, listPremiumThemes } from "@hex-core/themes";
import { themeToScopedRuntimeCss } from "@hex-core/tokens";

// Apply a theme via runtime override (no globals.css round-trip):
const css = themeToScopedRuntimeCss(midnightTheme, {
  scope: ".theme-midnight",
  mode: "dark",
});

// Drive a theme switcher UI from the catalog:
for (const { name, displayName, description } of listPremiumThemes()) {
  // …render a chip per theme
}
```

## Catalog (today)

| Name | Display name | Notes |
|---|---|---|
| `midnight` | Midnight | Dark canvas, indigo accents. Re-exported from `@hex-core/tokens`. |
| `ember` | Ember | Warm dark canvas with amber primary. Re-exported from `@hex-core/tokens`. |

Future premium presets (`fintech-dark`, `editorial-warm`, `data-dense`, `pastel-soft`, `monochrome-strict`) ship here directly.

## License

MIT
