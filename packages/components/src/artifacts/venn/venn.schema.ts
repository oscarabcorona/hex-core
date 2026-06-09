import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const vennSchema: ComponentSchemaDefinition = {
	name: "venn",
	displayName: "Venn",
	description:
		"Set-overlap diagram for 2 or 3 sets. Pure SVG; no heavy peer dep. Shows categorical overlap (which sets intersect) — NOT exact intersection cardinality (use an Euler-diagram solver for that).",
	category: "artifact",
	subcategory: "relational",
	props: [
		{
			name: "sets",
			type: "object",
			required: true,
			description: "Array of { id, label, value? }. Must have 2 or 3 entries; other counts render a friendly fallback.",
		},
		{
			name: "size",
			type: "number",
			required: false,
			default: 360,
			description: "Pixel size of the rendered SVG (it's square).",
		},
		{
			name: "onSetClick",
			type: "function",
			required: false,
			description: "Called with the clicked VennSet.",
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
	tokensUsed: ["primary", "accent", "secondary", "foreground", "muted-foreground", "background"],
	examples: [
		{
			title: "Three-set Venn",
			description: "Linux / Mac / Windows overlap.",
			code:
				"<Venn sets={[\n  { id: \"linux\", label: \"Linux\" },\n  { id: \"mac\", label: \"Mac\" },\n  { id: \"windows\", label: \"Windows\" },\n]} />",
			composition: ["venn", "set-overlap"],
		},
		{
			title: "Two-set Venn with values",
			description: "Show set sizes alongside labels.",
			code:
				"<Venn sets={[\n  { id: \"paid\", label: \"Paid\", value: 1200 },\n  { id: \"active\", label: \"Active\", value: 480 },\n]} />",
			composition: ["venn", "with-values"],
		},
	],
	ai: {
		whenToUse:
			"Show that two or three categorical sets overlap — feature support matrices (Linux ∩ Mac), cohort intersections (paid ∩ active), tag overlap. Use when the SHAPE of the overlap is the message.",
		whenNotToUse:
			"Don't use to communicate exact intersection sizes — circles are not area-scaled (use an Euler-diagram tool with a layout solver). Don't use for >3 sets — it stops being a Venn. Don't use for hierarchical / weighted / sequential relationships (use TreeMap, Sankey, Flowchart).",
		commonMistakes: [
			"Implying intersection cardinality from circle area — Venn circles are fixed-size visual references. The component does NOT solve for area-correct overlap regions; the schema documents this clearly",
			"Passing 4+ sets — strict Venn diagrams with 4+ sets aren't visually tractable. The component renders a friendly fallback in that case",
			"Mutating the sets array in place between renders — the layout pass is memoized on identity",
		],
		relatedComponents: ["chord", "matrix", "arc", "tree-map"],
		accessibilityNotes:
			"The SVG carries role=\"img\" with a <title> and <desc> listing the participating set labels. Interactive sets carry role=\"button\", tabIndex, and Enter/Space activation. For agent outputs, also expose a parallel list of sets so screen-reader users get the labels without relying on the visual.",
		tokenBudget: 802,
	},
	tags: ["artifact", "diagram", "venn", "set-overlap", "relational"],
};
