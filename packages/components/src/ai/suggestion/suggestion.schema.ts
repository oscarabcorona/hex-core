import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const suggestionSchema: ComponentSchemaDefinition = {
	name: "suggestion",
	displayName: "Suggestion",
	description: "Clickable prompt pill / quick-action chip. Forwards a payload to onSelect on click.",
	category: "ai",
	subcategory: "input",
	props: [
		{
			name: "value",
			type: "string",
			required: false,
			description: "Payload sent to onSelect. Defaults to the rendered children when they are a string.",
		},
		{
			name: "onSelect",
			type: "function",
			required: true,
			description: "Called with the payload when the chip is clicked.",
		},
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "Visible label.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Visible label of the chip.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "secondary", "ring", "foreground"],
	examples: [
		{
			title: "Starter prompts",
			description: "Render onboarding suggestions and drop into the composer on click.",
			code: '<Cluster gap="sm">\n  {STARTERS.map((s) => (\n    <Suggestion key={s} value={s} onSelect={setInput}>{s}</Suggestion>\n  ))}\n</Cluster>',
			composition: ["chat", "onboarding", "prompts"],
		},
	],
	ai: {
		whenToUse:
			"Show 3–6 starter prompts before the first turn, or follow-up prompts after an assistant turn. Combine with Cluster for wrap-friendly layout.",
		whenNotToUse:
			"Don't use for navigation (use Button or a link). Don't auto-send on click without showing the user what's about to be sent — set the value into Composer first.",
		commonMistakes: [
			"Auto-firing onSelect into useChat.append without populating the input first — feels surprising",
			"Long labels — these are pills, keep under ~40 chars",
		],
		relatedComponents: ["composer", "cluster", "button"],
		accessibilityNotes:
			"Real <button>, so keyboard activation and screen-reader announcement work natively. If the label is non-text, set `aria-label`.",
		tokenBudget: 556,
	},
	tags: ["ai", "suggestion", "prompt", "pill", "chip", "quick-action"],
};
