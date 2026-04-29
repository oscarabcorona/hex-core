import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const toolCallSchema: ComponentSchemaDefinition = {
	name: "tool-call",
	displayName: "ToolCall",
	description:
		"Collapsible card showing a tool/function invocation — name, lifecycle state badge, expandable args + result body.",
	category: "ai",
	subcategory: "agent",
	props: [
		{
			name: "name",
			type: "string",
			required: true,
			description: "Tool / function name (e.g. searchDocs, getWeather).",
		},
		{
			name: "state",
			type: "enum",
			required: true,
			description: "Lifecycle of the invocation.",
			enumValues: ["pending", "running", "result", "error"],
		},
		{
			name: "args",
			type: "object",
			required: false,
			description: "JSON-stringifiable input passed to the tool.",
		},
		{
			name: "result",
			type: "object",
			required: false,
			description: "JSON-stringifiable output returned by the tool. May be a string for plain-text results.",
		},
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: false,
			description: "Start expanded. Default collapsed to keep the chat clean.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the outer Collapsible root.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-collapsible", "clsx", "tailwind-merge"],
		internal: ["lib/utils", "ai/types"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "muted", "muted-foreground", "primary", "accent", "accent-foreground", "destructive", "ring", "background"],
	examples: [
		{
			title: "Done invocation",
			description: "Map an AI SDK `tool-*` part to a ToolCall.",
			code: '<ToolCall\n  name="searchDocs"\n  state="result"\n  args={{ query: "auth" }}\n  result={{ hits: docs.length }}\n/>',
			composition: ["agent", "tool-use"],
		},
		{
			title: "Streaming run",
			description: "While the tool is executing, show running state without args.",
			code: '<ToolCall name="getWeather" state="running" args={{ city: "NYC" }} />',
			composition: ["agent", "tool-use", "streaming"],
		},
	],
	ai: {
		whenToUse:
			"Render every tool/function invocation in an agent UI. Map AI SDK v5 `tool-TOOLNAME` parts (state: input-streaming|input-available|output-available|output-error) or LangChain `AIMessage.tool_calls` directly.",
		whenNotToUse:
			"Don't use for plain assistant text (use Message). Don't render the tool's actual UI here — ToolCall is a debug/transparency card; for a rich tool UI, render that as a sibling node inside the Message.",
		commonMistakes: [
			"Passing the entire AI SDK part object as `result` — extract the output payload first",
			"Setting `defaultOpen` for every call — quickly clutters the chat",
			"Using `state=\"result\"` for an error — use `error` so the user sees red",
		],
		relatedComponents: ["message", "reasoning", "loading-indicator"],
		accessibilityNotes:
			"Built on Radix Collapsible — keyboard expand/collapse with Enter/Space works natively. Add `aria-label` on the trigger if the tool name is opaque.",
		tokenBudget: 320,
	},
	tags: ["ai", "agent", "tool-call", "function-call", "collapsible", "transparency"],
};
