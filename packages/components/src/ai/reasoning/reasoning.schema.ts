import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const reasoningSchema: ComponentSchemaDefinition = {
	name: "reasoning",
	displayName: "Reasoning",
	description:
		"Collapsible thinking-trace block for Anthropic-style reasoning or chain-of-thought scratchpads. Optional duration in the header.",
	category: "ai",
	subcategory: "agent",
	props: [
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "Reasoning content. Wrap with Markdown for formatted thinking traces.",
		},
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: false,
			description: "Start expanded. Default collapsed.",
		},
		{
			name: "durationMs",
			type: "number",
			required: false,
			description: 'Time spent thinking in ms — renders "Thought for 4.2s" in the header.',
		},
		{
			name: "label",
			type: "string",
			required: false,
			description: "Override the default header label.",
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
			description: "Reasoning trace body.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-collapsible", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted", "muted-foreground", "ring"],
	examples: [
		{
			title: "Thinking trace with duration",
			description: 'Header reads "Thought for 4.2s" — body reveals the full trace on click.',
			code: '<Reasoning durationMs={4200}>\n  <Markdown>{thinkingMarkdown}</Markdown>\n</Reasoning>',
			composition: ["agent", "reasoning", "anthropic"],
		},
	],
	ai: {
		whenToUse:
			"Render Anthropic `thinking` blocks, chain-of-thought scratchpads, or any model-internal reasoning the user can optionally inspect.",
		whenNotToUse:
			"Don't use for the assistant's actual answer (use Message). Don't auto-open for routine turns — only worth expanding for debug or trust-building UX.",
		commonMistakes: [
			"Showing reasoning that wasn't actually produced — fabricating thinking blocks erodes trust",
			"`durationMs` measured from request start instead of model thinking time — use the model's reported duration when available",
		],
		relatedComponents: ["message", "tool-call", "markdown"],
		accessibilityNotes:
			"Radix Collapsible — keyboard expand/collapse via Enter/Space. The italic header is decorative; use the visible label for screen readers.",
		tokenBudget: 280,
	},
	tags: ["ai", "agent", "reasoning", "thinking", "chain-of-thought", "collapsible"],
};
