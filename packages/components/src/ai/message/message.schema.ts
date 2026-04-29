import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const messageSchema: ComponentSchemaDefinition = {
	name: "message",
	displayName: "Message",
	description:
		"Single chat-message row scoped to one speaker (user / assistant / system / tool). Headless content slot — pair with Markdown, CodeBlock, or ToolCall children.",
	category: "ai",
	subcategory: "chat",
	props: [
		{
			name: "role",
			type: "enum",
			required: true,
			description: "Speaker. Drives variant styling and the data-role attribute.",
			enumValues: ["user", "assistant", "system", "tool"],
		},
		{
			name: "children",
			type: "ReactNode",
			required: true,
			description: "Message content. Strings, Markdown, CodeBlock, ToolCall, or any composition.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes merged onto the row.",
		},
	],
	variants: [
		{
			name: "role",
			description: "Visual treatment per speaker.",
			values: [
				{ value: "user", description: "Tinted secondary background — user turns.", useWhen: "The author is the human." },
				{ value: "assistant", description: "Card background — model output.", useWhen: "The author is the LLM/agent." },
				{ value: "system", description: "Muted, italic — system instructions.", useWhen: "Rendering a visible system prompt or framing message." },
				{ value: "tool", description: "Accent left-border — tool messages distinct from assistant text.", useWhen: "Showing raw tool/function output as its own turn." },
			],
			default: "assistant",
		},
	],
	slots: [
		{
			name: "children",
			description: "Message body. Compose with Markdown, CodeBlock, ToolCall, or plain text.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["lib/utils", "ai/types"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["secondary", "foreground", "card", "card-foreground", "muted", "muted-foreground", "accent", "accent-foreground"],
	examples: [
		{
			title: "User and assistant turns",
			description: "Two messages alternating roles.",
			code: '<>\n  <Message role="user">What\'s the capital of France?</Message>\n  <Message role="assistant">Paris.</Message>\n</>',
			composition: ["chat", "turns"],
		},
		{
			title: "Composed assistant turn",
			description: "Markdown + ToolCall inside one assistant message.",
			code: '<Message role="assistant">\n  <Markdown>{response}</Markdown>\n  <ToolCall name="search" state="result" result={hits} />\n</Message>',
			composition: ["chat", "agent", "tool-use"],
		},
	],
	ai: {
		whenToUse:
			"Wrap every conversation turn — user, assistant, system, or tool. Pair with MessageList for the scrolling viewport. Compose Markdown, CodeBlock, and ToolCall as children for rich assistant turns.",
		whenNotToUse:
			"Don't use for non-conversational text (use Card or plain elements). Don't put streaming logic here — the consumer drives state, Message just renders.",
		commonMistakes: [
			"Adding streaming/fetch logic inside Message — keep it pure",
			"Using `role=\"tool\"` for assistant text that mentions a tool — `tool` is for the actual tool turn",
			"Hard-coding markdown rendering inside Message — pass <Markdown>{...}</Markdown> as a child instead",
		],
		relatedComponents: ["message-list", "markdown", "code-block", "tool-call", "message-actions"],
		accessibilityNotes:
			"Renders as a div with `data-role`. For screen-reader chat semantics, wrap MessageList in `role=\"log\"` and consider `aria-live=\"polite\"` on the streaming container.",
		tokenBudget: 220,
	},
	tags: ["ai", "chat", "message", "turn", "conversation"],
};
