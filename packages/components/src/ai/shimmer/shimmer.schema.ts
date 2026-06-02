import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const shimmerSchema: ComponentSchemaDefinition = {
	name: "shimmer",
	displayName: "Shimmer",
	description:
		"Single-line streaming placeholder. Used during the dead-time between user submission and first stream token. Renders a motion-safe pulsing bar (Tailwind animate-pulse) that gates on `prefers-reduced-motion`.",
	category: "ai",
	subcategory: "feedback",
	props: [
		{
			name: "width",
			type: "string",
			required: false,
			default: "100%",
			description: "CSS width — accepts any width value.",
		},
		{
			name: "height",
			type: "string",
			required: false,
			default: "1.5rem",
			description: "CSS height — defaults to a single line.",
		},
		{
			name: "durationMs",
			type: "number",
			required: false,
			default: 1500,
			description: "Sweep cycle duration in milliseconds.",
		},
		{
			name: "label",
			type: "string",
			required: false,
			default: "Loading…",
			description: "Accessible label announced to screen readers.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "foreground"],
	examples: [
		{
			title: "Streaming placeholder before first token",
			description: "Shows up between user submit and first model token; replaces with the streaming Markdown once tokens arrive.",
			code: '{isStreaming && firstTokenAt === null ? <Shimmer width="80%" /> : null}',
			composition: ["chat", "streaming", "loading"],
		},
		{
			title: "Compose with MessageList for the assistant placeholder row",
			description: "Render a Shimmer inside a Message while waiting for the first chunk.",
			code: '<MessageList>\n  {messages.map((m) => <Message key={m.id} role={m.role}>{m.content}</Message>)}\n  {isStreaming ? (\n    <Message role="assistant"><Shimmer width="60%" /></Message>\n  ) : null}\n</MessageList>',
			composition: ["chat", "streaming"],
		},
	],
	ai: {
		whenToUse:
			"In the conversation pane during the dead-time between a user prompt submission and the first streaming token. Pair with Message so the placeholder occupies the same visual slot the streamed content will land in.",
		whenNotToUse:
			"Don't use for whole-screen loading (use Loading). Don't use for arbitrary skeleton shapes (use Skeleton). Don't use after the first token has arrived — once the model is streaming, render the partial content directly.",
		commonMistakes: [
			"Showing Shimmer through the entire response — once the first token arrives, swap to a Markdown render of the partial buffer",
			"Sizing the bar too short (width < 30%) — the sweep cycle becomes visually jittery; keep at ~60–80% of message-row width",
			"Using Shimmer for a whole-card placeholder (use Skeleton or Loading)",
			"Setting `durationMs` < 800 — feels nervous; the 1500ms default matches a calm waiting cadence",
		],
		relatedComponents: ["loading", "loading-indicator", "skeleton", "message"],
		accessibilityNotes:
			"Renders with `role=\"status\"` and `aria-live=\"polite\"`, so screen readers announce the loading label without preempting other content. The pulse animation is gated on `motion-safe:` — users with `prefers-reduced-motion: reduce` see a static bar rather than the pulsing one.",
		tokenBudget: 841,
	},
	tags: ["ai", "loading", "streaming", "placeholder", "feedback"],
};
