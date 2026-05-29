import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const progressSchema: ComponentSchemaDefinition = {
	name: "progress",
	displayName: "Progress",
	description: "A horizontal progress bar showing completion from 0 to 100%. Built on Radix UI Progress.",
	category: "primitive",
	subcategory: "feedback",
	props: [
		{
			name: "value",
			type: "number",
			required: false,
			description: "Current value (0–max). Omit to render at 0% (both visually and in ARIA — the component clamps undefined to 0). Use Skeleton for indeterminate loading states.",
		},
		{ name: "max", type: "number", required: false, default: 100, description: "Maximum value" },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-progress", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["secondary", "primary"],
	examples: [
		{
			title: "Basic progress",
			description: "At 60%",
			code: "<Progress value={60} />",
		},
	],
	ai: {
		whenToUse:
			"Use for deterministic progress where completion is measurable: file uploads, multi-step form completion, batch processing. Pair with a visible numeric label where precision matters.",
		whenNotToUse:
			"Don't use for indeterminate waits (use a spinner or Skeleton). Don't use for completion over long time-spans without a human-readable ETA.",
		commonMistakes: [
			"Passing 0–1 float instead of 0–100",
			"Not labeling the progress (users can't tell what's progressing)",
			"Updating too frequently (>30fps) — wastes renders",
		],
		relatedComponents: ["skeleton", "slider", "sonner"],
		accessibilityNotes:
			"Radix wires role='progressbar', aria-valuenow, aria-valuemin, aria-valuemax. Pair with a visible label or aria-label for context.",
		tokenBudget: 443,
	},
	tags: ["progress", "loading", "bar", "feedback", "determinate"],
};
