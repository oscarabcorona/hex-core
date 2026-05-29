import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const containerSchema: ComponentSchemaDefinition = {
	name: "container",
	displayName: "Container",
	description:
		"Centered max-width wrapper that constrains content to readable widths. Sizes map to `--container-*` prose-width tokens; padding maps to `--space-*`.",
	category: "primitive",
	subcategory: "layout",
	props: [
		{
			name: "size",
			type: "enum",
			required: false,
			default: "lg",
			description:
				"Max-width preset bound to `--container-*` tokens (sm=33rem, md=40rem, lg=50rem, xl=66rem, full=100%).",
			enumValues: ["sm", "md", "lg", "xl", "full"],
		},
		{
			name: "padding",
			type: "enum",
			required: false,
			default: "md",
			description:
				"Horizontal padding bound to `--space-*` tokens (none=0, sm=0.75rem, md=1rem, lg=2rem).",
			enumValues: ["none", "sm", "md", "lg"],
		},
		{
			name: "asChild",
			type: "boolean",
			required: false,
			default: false,
			description:
				"Render as a different element via Radix `Slot`. Use to render as `<main>`, `<section>`, etc. for landmark semantics.",
		},
	],
	variants: [
		{
			name: "size",
			description: "Max-width preset bound to `--container-*` tokens.",
			values: [
				{ value: "sm", description: "33rem (≈530px) — narrow column for short content." },
				{ value: "md", description: "40rem (≈640px) — comfortable reading width." },
				{ value: "lg", description: "50rem (≈800px) — default; standard article width." },
				{ value: "xl", description: "66rem (≈1056px) — wider canvas for dashboards or marketing." },
				{ value: "full", description: "100% — disable max-width clamp." },
			],
			default: "lg",
		},
		{
			name: "padding",
			description: "Horizontal padding bound to `--space-*` tokens.",
			values: [
				{ value: "none", description: "0 — flush to container edges." },
				{ value: "sm", description: "0.75rem — tight gutter." },
				{ value: "md", description: "1rem — default; standard reading gutter." },
				{ value: "lg", description: "2rem — generous gutter for marketing pages." },
			],
			default: "md",
		},
	],
	slots: [
		{
			name: "children",
			description: "Page content to constrain — typically a section, article, or grid.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["class-variance-authority", "@radix-ui/react-slot"],
		internal: ["lib/utils"],
		peer: ["react"],
	},
	tokensUsed: [
		"--container-sm",
		"--container-md",
		"--container-lg",
		"--container-xl",
		"--space-3",
		"--space-4",
		"--space-8",
	],
	examples: [
		{
			title: "Reading-width article",
			description: "lg size (50rem) + md padding for an article body.",
			code: '<Container size="lg" padding="md">\n  <article>...</article>\n</Container>',
		},
		{
			title: "Full-width hero",
			description: "Use size=full when you want the section to span the viewport.",
			code: '<Container size="full" padding="none">\n  <Hero />\n</Container>',
		},
	],
	ai: {
		whenToUse:
			"Use to constrain page content to readable widths. Pair with `Stack` or `Grid` inside for vertical/grid layouts. Default for any centered article, settings page, or marketing section.",
		whenNotToUse:
			"Don't use inside another `Container` (double-clamping). Don't use as a drop-in for `<main>` semantics — it's a layout primitive, not a landmark. For full-bleed sections (edge-to-edge banners), pass `size=\"full\" padding=\"none\"`.",
		commonMistakes: [
			"Wrapping a `Container` in another `Container` and getting an unexpectedly narrow column",
			"Using `padding=\"none\"` and forgetting that children still need their own gutter — the parent contributes nothing",
			"Treating `lg` as the largest size — `xl` (66rem) and `full` are bigger",
		],
		relatedComponents: ["stack", "grid", "cluster"],
		accessibilityNotes:
			"Container is presentational. Wrap in a semantic landmark (`<main>`, `<section>`, `<article>`) when the page structure needs it; Container itself renders a plain `<div>`.",
		tokenBudget: 1106,
	},
	tags: ["container", "layout", "wrapper", "max-width", "primitive"],
};
