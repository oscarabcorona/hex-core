# @hex-core/preview

Demo-surface primitives for showcasing Hex Core components on otherwise-flat pages.

## Why

Hex Core components (Button outline/secondary, Input, Card, etc.) are tuned to read against a Card-elevated surface. Dropped onto a flat-white page background they appear washed out — the borders and shadows that carry shape have been deliberately kept subtle (see the `--border` and `--input` token notes in `@hex-core/tokens`).

This package exports `<DemoSurface>`, the same elevated container the official docs site uses to wrap its previews. Consumers can drop it around any demo and get the right visual context without re-creating the recipe.

## Install

```bash
pnpm add @hex-core/preview
```

Peer deps: `react ^18 || ^19`, `react-dom ^18 || ^19`. Tailwind CSS classes assume the consumer's app already loads Hex Core's token CSS (so utilities like `bg-muted` resolve).

## Use

```tsx
import { DemoSurface } from "@hex-core/preview";
import { Button } from "@hex-core/components";

export function ButtonDemo() {
	return (
		<DemoSurface>
			<Button variant="outline">Visible on white pages</Button>
		</DemoSurface>
	);
}
```

Override the minimum height when wrapping a tall demo:

```tsx
<DemoSurface minHeight="400px">{/* … */}</DemoSurface>
```

Pass any standard div attributes — `id`, `data-*`, `className` (merged with Tailwind), etc.

## License

MIT
