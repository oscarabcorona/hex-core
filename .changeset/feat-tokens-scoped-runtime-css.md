---
"@hex-core/tokens": minor
---

Adds `themeToScopedRuntimeCss(theme, { scope?, mode? })` — render a theme as a single CSS rule scoped to any selector, suitable for runtime token overrides without round-tripping through `globals.css`.

Output emits **both** namespaces in one pass:

- `--<key>: <value>;` (raw triplet) — preserves alpha-composition utilities like `bg-background/50` that read the bare `H S% L%` form.
- `--color-<key>: hsl(<value>);` (full `hsl()` string) — feeds Tailwind v4's `@theme` block so generated utilities (`bg-background`, `text-primary`, etc.) resolve against the override.

Non-color tokens (radii, durations, spacing, font sizes) only emit the raw `--<key>` form.

```ts
import { defaultTheme, themeToScopedRuntimeCss } from "@hex-core/tokens";

const css = themeToScopedRuntimeCss(defaultTheme, {
	scope: ".studio-canvas-active",
	mode: "light",
});
// → ".studio-canvas-active { --background: 0 0% 100%; --color-background: hsl(0 0% 100%); … }"
```

Closes the gap previously bridged by hand in downstream studios — see the new "Runtime overrides" section in the README.

Also exports the supporting `ScopedRuntimeCssOptions` type.
