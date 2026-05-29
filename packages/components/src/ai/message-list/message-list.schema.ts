import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const messageListSchema: ComponentSchemaDefinition = {
	name: "message-list",
	displayName: "MessageList",
	description:
		"Auto-scrolling viewport for a chat stream. Pins to the bottom during streaming unless the user scrolls up to read history.",
	category: "ai",
	subcategory: "chat",
	props: [
		{
			name: "autoScroll",
			type: "boolean",
			required: false,
			default: true,
			description: "Pin to bottom on content change (when the user is already near the bottom).",
		},
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "Sequence of <Message> elements.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes (e.g. height, padding).",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "Messages to render in order.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Basic chat",
			description: "Map messages from useChat into a viewport with bottom-pin behavior.",
			code: '<MessageList className="h-96">\n  {messages.map((m) => (\n    <Message key={m.id} role={m.role}>{m.content}</Message>\n  ))}\n</MessageList>',
			composition: ["chat", "scroll"],
		},
	],
	ai: {
		whenToUse:
			"Wrap a list of <Message> components when you want auto-scroll-on-stream behavior. Always set an explicit height (h-*, max-h-*) on the className so the viewport actually scrolls.",
		whenNotToUse:
			"Don't use for static FAQs or non-streaming layouts (use a normal Stack). Don't use as a generic scroll container — its bottom-pin behavior is opinionated.",
		commonMistakes: [
			"Forgetting to set a height — the viewport won't scroll without `h-*` or `max-h-*`",
			"Disabling autoScroll while still expecting bottom-pin behavior — they're the same flag",
			"Putting non-Message children inside — a divider or banner breaks the role=log semantics",
		],
		relatedComponents: ["message", "composer", "loading-indicator"],
		accessibilityNotes:
			"Renders as `role=\"log\"` with `aria-live=\"polite\"` and `aria-relevant=\"additions\"` so assistive tech announces new turns. If you replace turns wholesale (e.g. on regenerate), pass `aria-relevant=\"additions removals\"` as a prop — props spread onto the underlying div and override the default.",
		tokenBudget: 622,
	},
	tags: ["ai", "chat", "scroll", "viewport", "streaming"],
};
