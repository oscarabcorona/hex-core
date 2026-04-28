# @hex-core/themes

## 0.1.1

### Patch Changes

- Updated dependencies [b9a072d]
  - @hex-core/registry@0.3.0
  - @hex-core/tokens@1.2.1

## 0.1.0

### Minor Changes

- 76752d4: Initial release. Establishes a separate publish/version surface for theme presets so the bundled `@hex-core/tokens` package can stay focused on the canonical default theme + the transformer functions.

  Today: re-exports `midnightTheme` and `emberTheme` from `@hex-core/tokens` and adds catalog helpers (`premiumThemes`, `getPremiumTheme(name)`, `listPremiumThemes()`) shaped to mirror `listThemes()` from `@hex-core/tokens`. Future premium presets (`fintech-dark`, `editorial-warm`, `data-dense`, `pastel-soft`, `monochrome-strict`) will land here directly without bumping `tokens`.

  ```ts
  import { midnightTheme, listPremiumThemes } from "@hex-core/themes";
  import { themeToScopedRuntimeCss } from "@hex-core/tokens";

  const css = themeToScopedRuntimeCss(midnightTheme, { mode: "dark" });
  const catalog = listPremiumThemes(); // [{ name, displayName, description }, …]
  ```

  Non-breaking — `@hex-core/tokens` continues to export `midnightTheme` / `emberTheme` directly, so existing consumers don't need to migrate. The new package just gives studios and theme switchers a single import surface for "premium catalog" that grows independently.
