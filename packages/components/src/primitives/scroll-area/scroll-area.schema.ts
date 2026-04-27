import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const scrollAreaSchema: ComponentSchemaDefinition = {
	name: "scroll-area",
	displayName: "Scroll Area",
	description: "A scrollable region with custom-styled scrollbars that match the design system. Content must be explicitly sized.",
	category: "primitive",
	subcategory: "layout",
	props: [
		{
			name: "type",
			type: "enum",
			required: false,
			default: "hover",
			description: "When scrollbars are visible",
			enumValues: ["auto", "always", "scroll", "hover"],
		},
		{ name: "className", type: "string", required: false, description: "Set dimensions via Tailwind (e.g. h-72 w-48)" },
		{
			name: "viewportTabIndex",
			type: "number",
			required: false,
			default: 0,
			description: "tabIndex applied to the scroll viewport. Defaults to 0 so keyboard users can scroll without a pointer; pass -1 to skip the viewport in the tab order when wrapping decorative or already-keyboard-reachable content.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Any content — will be wrapped in a scrollable viewport",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-scroll-area", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["border"],
	examples: [
		{
			title: "Fixed-height list",
			description: "50 items in a 200px-tall scrollable region",
			code: '<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">\n  {Array.from({ length: 50 }).map((_, i) => (\n    <div key={i} className="text-sm">Item {i + 1}</div>\n  ))}\n</ScrollArea>',
		},
	],
	ai: {
		whenToUse:
			"Use when you need styled scrollbars that match the design system — sidebars, code blocks, large lists in dialogs. Must have explicit dimensions (height/width).",
		whenNotToUse:
			"Don't use for the whole page (use native browser scrollbars). Don't use for content that should grow freely (omit the ScrollArea and use overflow-auto directly).",
		commonMistakes: [
			"Forgetting to set height/width — scrollbars don't appear",
			"Using for the whole page",
			"Nesting ScrollAreas (confusing UX)",
			"Wrapping decorative or already-keyboard-reachable content without setting viewportTabIndex={-1} — adds an unnecessary tab stop",
		],
		relatedComponents: [],
		accessibilityNotes:
			"The viewport is keyboard-focusable by default (viewportTabIndex=0) so users can scroll long content via arrow keys / PgUp / PgDn / Home / End without a pointer. Pass viewportTabIndex={-1} when the contents are already in the tab order or purely decorative. For very long lists, consider pagination or virtualization.",
		tokenBudget: 350,
	},
	tags: ["scroll-area", "scroll", "overflow", "scrollbar", "layout"],
};
