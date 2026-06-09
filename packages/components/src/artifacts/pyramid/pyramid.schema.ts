import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const pyramidSchema: ComponentSchemaDefinition = {
	name: "pyramid",
	displayName: "Pyramid",
	description:
		"Ranked-tier pyramid. Tiers stack top-to-bottom; widths can grow toward the base (widening) or shrink (narrowing). Pure SVG; no heavy peer dep. Distinct from Funnel — Pyramid encodes RANK, Funnel encodes FLOW.",
	category: "artifact",
	subcategory: "flow",
	props: [
		{
			name: "tiers",
			type: "object",
			required: true,
			description: "Ordered top-to-bottom array of { id, label, value? }. The first entry is the apex.",
		},
		{
			name: "shape",
			type: "enum",
			required: false,
			default: "widening",
			description: "Tier-width direction — \"widening\" grows toward the base; \"narrowing\" shrinks toward it.",
			enumValues: ["widening", "narrowing"],
		},
		{
			name: "width",
			type: "number",
			required: false,
			default: 480,
			description: "SVG pixel width.",
		},
		{
			name: "height",
			type: "number",
			required: false,
			default: 360,
			description: "SVG pixel height.",
		},
		{
			name: "gap",
			type: "number",
			required: false,
			default: 4,
			description: "Pixel gap between tiers.",
		},
		{
			name: "showValues",
			type: "boolean",
			required: false,
			default: true,
			description: "Show each tier's `value` next to its label when present.",
		},
		{
			name: "onTierClick",
			type: "function",
			required: false,
			description: "Called with the clicked PyramidTier.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the SVG element.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["primary", "primary-foreground", "background"],
	examples: [
		{
			title: "Maslow's hierarchy",
			description: "Classic widening pyramid with 5 tiers.",
			code:
				"<Pyramid tiers={[\n  { id: \"a\", label: \"Self-actualization\" },\n  { id: \"e\", label: \"Esteem\" },\n  { id: \"l\", label: \"Love & belonging\" },\n  { id: \"s\", label: \"Safety\" },\n  { id: \"p\", label: \"Physiological\" },\n]} />",
			composition: ["pyramid", "rank", "hierarchy"],
		},
		{
			title: "Inverted pyramid (narrowing) for ranked output",
			description: "Use \"narrowing\" when the most important tier sits at the top.",
			code:
				"<Pyramid shape=\"narrowing\" tiers={[\n  { id: \"north-star\", label: \"North star\" },\n  { id: \"okrs\", label: \"OKRs\" },\n  { id: \"projects\", label: \"Projects\" },\n  { id: \"tasks\", label: \"Tasks\" },\n]} />",
			composition: ["pyramid", "narrowing"],
		},
	],
	ai: {
		whenToUse:
			"Visualize a ranked categorical hierarchy where tier order is meaningful but each tier is a distinct level (not a subset of the previous). Maslow-style needs hierarchy, organizational tiers, content hierarchy (north star → tasks).",
		whenNotToUse:
			"Don't use for conversion drop-off where each stage is a strict subset of the previous (use Funnel — it shows the conversion ratio between stages). Don't use for value-scaled hierarchies (use TreeMap or Sunburst). Don't use for >7 tiers — labels become unreadable.",
		commonMistakes: [
			"Confusing Pyramid with Funnel — Funnel encodes FLOW (value moves between stages); Pyramid encodes RANK (each tier is a distinct level)",
			"Tier order matters — the first array element is the apex. Reversing the array flips the meaning",
			"Passing values that don't actually rank — Pyramid doesn't sort; it trusts your order",
		],
		relatedComponents: ["funnel", "sankey", "tree-map", "sunburst"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing tier count and shape. For agent outputs, also expose a parallel ordered list (<ol>) of labels so screen-reader users get the rank order without relying on visual position.",
		tokenBudget: 1076,
	},
	tags: ["artifact", "diagram", "pyramid", "rank", "hierarchy"],
};
