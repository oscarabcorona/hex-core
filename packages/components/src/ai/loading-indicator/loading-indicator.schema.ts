import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const loadingIndicatorSchema: ComponentSchemaDefinition = {
	name: "loading-indicator",
	displayName: "LoadingIndicator",
	description: "Streaming/typing feedback with three motion variants — dots, pulse, bar.",
	category: "ai",
	subcategory: "feedback",
	props: [
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "dots",
			description: "Animation style.",
			enumValues: ["dots", "pulse", "bar"],
		},
		{
			name: "size",
			type: "enum",
			required: false,
			default: "default",
			description: "Text/icon scale.",
			enumValues: ["sm", "default", "lg"],
		},
		{
			name: "label",
			type: "string",
			required: false,
			description: 'Optional adjacent text label (e.g. "Thinking…").',
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes.",
		},
	],
	variants: [
		{
			name: "variant",
			description: "Motion style.",
			values: [
				{ value: "dots", description: "Three bouncing dots — classic typing indicator.", useWhen: "You want a familiar chat-style loading affordance." },
				{ value: "pulse", description: "Single throbbing circle — minimal.", useWhen: "Tight inline space; one-character signal." },
				{ value: "bar", description: "Horizontal sweep — implies progress without claiming a percentage.", useWhen: "Longer-running task (search, retrieval) where dots feel too perpetual." },
			],
			default: "dots",
		},
	],
	slots: [],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted-foreground"],
	examples: [
		{
			title: "Inline typing dots",
			description: "Render while waiting for the first token.",
			code: '{isLoading && <LoadingIndicator label="Thinking…" />}',
			composition: ["chat", "loading"],
		},
	],
	ai: {
		whenToUse:
			"Show during the gap between submitting a prompt and the first streamed token, or while a long-running tool call is in flight.",
		whenNotToUse:
			"Don't use for known-percent progress (use Progress). Don't keep visible after the first token streams in — stream itself signals activity.",
		commonMistakes: [
			"Leaving the indicator visible while content streams — overlap looks broken",
			"Using `bar` for sub-second waits — the sweep can't complete a cycle",
		],
		relatedComponents: ["message", "composer"],
		accessibilityNotes:
			"Renders as `role=\"status\"` with `aria-live=\"polite\"` and an `aria-label`. Pass a meaningful label so screen readers announce \"Searching docs\" rather than the default \"Loading\".",
		tokenBudget: 200,
	},
	tags: ["ai", "loading", "spinner", "typing", "indicator", "streaming"],
};
