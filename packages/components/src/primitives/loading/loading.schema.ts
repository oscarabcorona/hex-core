import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const loadingSchema: ComponentSchemaDefinition = {
	name: "loading",
	displayName: "Loading",
	description:
		"A composed loading-placeholder pattern for lists, cards, and stacks. Skeleton is the atom; Loading is the canonical molecule most surfaces want.",
	category: "primitive",
	subcategory: "feedback",
	props: [
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "list",
			description: "Layout family — picks the row shape.",
			enumValues: ["list", "card", "stack"],
		},
		{
			name: "rows",
			type: "number",
			required: false,
			default: 3,
			description: "Number of placeholder rows to render. Each row may contain multiple Skeleton elements depending on variant — list emits 1 per row; card emits 3 (heading + 2 body lines); stack emits 3 (avatar + 2 text lines).",
		},
		{
			name: "label",
			type: "string",
			required: false,
			default: "Loading…",
			description: "sr-only label announced by screen readers via aria-live polite.",
		},
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [
		{
			name: "variant",
			description: "Layout family for the placeholder rows.",
			values: [
				{
					value: "list",
					description: "Single full-width line per row — table / list / sidebar nav loaders.",
					useWhen: "the surface being filled is a flat list of equally-shaped rows",
				},
				{
					value: "card",
					description: "Heading + two body lines inside a bordered card surface.",
					useWhen: "loading a Card-shaped widget (settings panel, dashboard tile)",
				},
				{
					value: "stack",
					description: "Avatar + two-line text block per row — message / contact / search-result loaders.",
					useWhen: "loading a list of avatar-paired items (chat history, contact list, comment thread)",
				},
			],
			default: "list",
		},
	],
	slots: [],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["primitives/skeleton/skeleton"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "card", "border"],
	examples: [
		{
			title: "List loader",
			description: "5 placeholder rows for a dashboard table",
			code: '<Loading rows={5} variant="list" />',
			composition: ["loading", "table"],
		},
		{
			title: "Card loader",
			description: "Card-shaped placeholder with heading + 2 body lines",
			code: '<Loading variant="card" />',
			composition: ["loading", "card", "widget"],
		},
		{
			title: "Stack loader (chat / contacts)",
			description: "Avatar + 2-line text rows",
			code: '<Loading rows={4} variant="stack" />',
			composition: ["loading", "stack", "chat"],
		},
	],
	ai: {
		whenToUse:
			"Use when fetching data for a list, card, or avatar-paired stack and you want pre-arranged placeholders. Pair the rows count with how many items you expect — avoid 10-row loaders for 2-item results (jarring on resolve).",
		whenNotToUse:
			"Don't use for a single shaped placeholder (use Skeleton). Don't use when the wait has a measurable percent-done (use Progress). Don't use for full-page transitions where a top progress bar is more informative.",
		commonMistakes: [
			"Forgetting `aria-live` would prevent screen-reader announcement — Loading already wires it; don't override role",
			"Using too many rows — flashes a heavy 'something's wrong' impression",
			"Applying Loading inside a Card AND also wrapping in another Card — double-bordered shimmer",
		],
		antiPatterns: [
			{
				mistake: "Using Loading for a single shaped placeholder (avatar circle, heading line, image rectangle)",
				insteadUse: "skeleton",
				why: "Skeleton is the atom; render exactly one Skeleton with the right size class. Loading composes Skeletons for canonical multi-row patterns — no value if you only need one shape.",
			},
			{
				mistake: "Using Loading when the wait has a measurable percent (file upload, batch import)",
				insteadUse: "progress",
				why: "Progress's `value` prop announces actual completion to assistive tech. Loading is for indeterminate waits.",
			},
			{
				mistake: "Using Loading for a full-page route transition where the user just clicked a link",
				insteadUse: "skeleton",
				why: "Compose page-shaped Skeletons via `generateStaticParams` + Suspense; full-page Loading flashes 'work is happening here' while the right answer is 'show the page shell instantly.'",
			},
		],
		relatedComponents: ["skeleton", "progress", "empty", "error-state"],
		accessibilityNotes:
			"role='status' + aria-live='polite' + sr-only label, so screen readers announce on first render. Caller doesn't need to wire any of this.",
		tokenBudget: 300,
	},
	tags: ["loading", "skeleton", "placeholder", "feedback"],
};
