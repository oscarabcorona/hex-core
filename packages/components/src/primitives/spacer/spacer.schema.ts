import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const spacerSchema: ComponentSchemaDefinition = {
	name: "spacer",
	displayName: "Spacer",
	description:
		"Declarative whitespace block bound to `--space-*` tokens. Use when sibling spacing can't come from a parent's `gap`.",
	category: "primitive",
	subcategory: "layout",
	props: [
		{
			name: "size",
			type: "enum",
			required: false,
			default: "md",
			description:
				"Spacing token (xs=0.25rem, sm=0.5rem, md=1rem, lg=2rem, xl=4rem). Bound to `--space-*`.",
			enumValues: ["xs", "sm", "md", "lg", "xl"],
		},
		{
			name: "axis",
			type: "enum",
			required: false,
			default: "vertical",
			description: "Which axis to expand. Vertical = height; horizontal = width; both = square.",
			enumValues: ["vertical", "horizontal", "both"],
		},
	],
	variants: [
		{
			name: "size",
			description: "Spacer extent bound to `--space-*` tokens.",
			values: [
				{ value: "xs", description: "0.25rem — micro-gap." },
				{ value: "sm", description: "0.5rem — tight separation." },
				{ value: "md", description: "1rem — default; standard breathing room." },
				{ value: "lg", description: "2rem — section-scale separation." },
				{ value: "xl", description: "4rem — major separation between hero areas." },
			],
			default: "md",
		},
		{
			name: "axis",
			description: "Which axis the spacer extends along.",
			values: [
				{ value: "vertical", description: "Default — fixed height, 1px width." },
				{ value: "horizontal", description: "Fixed width, 1px height — for flex rows." },
				{ value: "both", description: "Square block — rare; usually pick one axis." },
			],
			default: "vertical",
		},
	],
	slots: [],
	dependencies: {
		npm: ["class-variance-authority"],
		internal: ["lib/utils"],
		peer: ["react"],
	},
	tokensUsed: ["--space-1", "--space-2", "--space-4", "--space-8", "--space-16"],
	examples: [
		{
			title: "Vertical breathing room",
			description: "Push two sections apart inside a parent that doesn't manage gap.",
			code: '<>\n  <Hero />\n  <Spacer size="xl" />\n  <Features />\n</>',
		},
		{
			title: "Horizontal flex spacer",
			description: "Push siblings to opposite ends of a flex row.",
			code: '<div className="flex items-center">\n  <Logo />\n  <Spacer axis="horizontal" size="lg" />\n  <Nav />\n</div>',
		},
	],
	ai: {
		whenToUse:
			"Use as an explicit whitespace primitive when you can't (or don't want to) use `gap` on the parent — typically: pushing siblings apart inside a flex row that already has gap-0, or inserting one-off vertical breathing room between top-level sections that aren't wrapped in a Stack.",
		whenNotToUse:
			"Don't use Spacer when a `Stack` or `Cluster` parent's `gap` would do the same thing — that scales better and keeps the spacing concern with the layout primitive. Don't use Spacer to flush content to one edge of a flex container — use `ml-auto` / `justify-between` directly.",
		commonMistakes: [
			"Using `<Spacer />` between every child in a Stack — just set the Stack's `gap` instead",
			"Using `axis=\"both\"` and getting a square block where you wanted a line — `both` is rare, usually you want vertical or horizontal",
			"Setting size=\"lg\" on a horizontal spacer and getting nothing visible because the parent isn't a flex row — Spacer reserves space, it doesn't push siblings on its own",
		],
		relatedComponents: ["stack", "cluster", "separator"],
		accessibilityNotes:
			"Spacer is `aria-hidden=\"true\"` — screen readers skip it. Don't use a Spacer where a `Separator` would convey meaning (a thematic break should be `Separator`, not `Spacer`).",
		tokenBudget: 985,
	},
	tags: ["spacer", "layout", "whitespace", "spacing", "primitive"],
};
