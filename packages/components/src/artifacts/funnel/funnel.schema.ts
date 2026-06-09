import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const funnelSchema: ComponentSchemaDefinition = {
	name: "funnel",
	displayName: "Funnel",
	description:
		"Conversion funnel — vertical stack of trapezoidal stages whose width is proportional to each stage's value. Pure SVG; no heavy peer dep.",
	category: "artifact",
	subcategory: "flow",
	props: [
		{
			name: "stages",
			type: "object",
			required: true,
			description: "Ordered top-to-bottom array of { id, label, value }. Values must be non-negative.",
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
			description: "Pixel gap between stages.",
		},
		{
			name: "showConversion",
			type: "boolean",
			required: false,
			default: true,
			description: "Show stage-to-stage conversion percentages alongside the funnel.",
		},
		{
			name: "onStageClick",
			type: "function",
			required: false,
			description: "Called with the clicked FunnelStage.",
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
	tokensUsed: ["primary", "primary-foreground", "muted-foreground", "background"],
	examples: [
		{
			title: "Signup funnel",
			description: "Standard top-of-funnel → conversion drop-off.",
			code:
				"<Funnel stages={[\n  { id: \"visit\", label: \"Visited\", value: 10000 },\n  { id: \"signup\", label: \"Signed up\", value: 1200 },\n  { id: \"active\", label: \"Active\", value: 480 },\n  { id: \"paid\", label: \"Paid\", value: 95 },\n]} />",
			composition: ["funnel", "conversion", "stages"],
		},
		{
			title: "Click stages to drill in",
			description: "Wire onStageClick to a route or modal for stage detail.",
			code: "<Funnel stages={data} onStageClick={(s) => router.push(`/stages/${s.id}`)} />",
			composition: ["funnel", "interactive"],
		},
	],
	ai: {
		whenToUse:
			"Visualize linear conversion drop-off — onboarding step completion, marketing-funnel rates, sales pipeline stages, ETL row counts. Use when each stage is a strict subset of the previous and the magnitude of the drop is the message.",
		whenNotToUse:
			"Don't use for non-monotonic data where a later stage can exceed an earlier one (use a column chart). Don't use for branching funnels where flow splits across paths (use Sankey). Don't use for ranked categorical data without a flow concept (use Pyramid).",
		commonMistakes: [
			"Stage values that aren't monotonically non-increasing — visually misleads users into thinking the funnel \"recovers\". Validate upstream",
			"Negative values — produce zero-width stages or NaN positions. Filter or clamp upstream",
			"More than ~8 stages — labels become unreadable. Group adjacent stages or use Sankey",
		],
		relatedComponents: ["sankey", "pyramid", "flowchart", "diagram"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> summarizing stage count and peak value. For agent outputs, also expose a parallel <table> of label/value/conversion-rate triples so screen-reader users get the magnitudes.",
		tokenBudget: 887,
	},
	tags: ["artifact", "diagram", "funnel", "conversion", "flow"],
};
