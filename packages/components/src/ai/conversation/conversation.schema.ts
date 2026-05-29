import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const conversationSchema: ComponentSchemaDefinition = {
	name: "conversation",
	displayName: "Conversation",
	description:
		"High-level chat shell. Composes `<MessageList>` over a messages array, an optional `<Sources>` panel, an optional `<Shimmer>` placeholder during the dead-time before the first stream token, and a `<Composer>` row at the bottom.",
	category: "ai",
	subcategory: "chat",
	props: [
		{
			name: "messages",
			type: "object",
			required: true,
			description: "Array of `ConversationMessage` objects ({ id: string; role: Role; content: ReactNode }). Each renders as one `<Message>`.",
		},
		{
			name: "onSubmit",
			type: "function",
			required: true,
			description: "Called with the trimmed text when the user submits the composer.",
		},
		{
			name: "placeholder",
			type: "string",
			required: false,
			default: "Ask anything…",
			description: "Composer placeholder.",
		},
		{
			name: "value",
			type: "string",
			required: false,
			description: "Controlled composer text. Pass with `onValueChange` to take control of the input — useful for suggested prompts, voice transcripts, or form-library integration.",
		},
		{
			name: "onValueChange",
			type: "function",
			required: false,
			description: "Called whenever the composer text changes. Required when `value` is set.",
		},
		{
			name: "isStreaming",
			type: "boolean",
			required: false,
			default: false,
			description: "When true, renders a `<Shimmer>` placeholder above the composer (use during the dead time before the first stream token arrives).",
		},
		{
			name: "sources",
			type: "object",
			required: false,
			description: "Optional `SourceRef[]` rendered as a `<Sources>` panel beneath the message stream.",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the composer (e.g. while waiting on a tool call).",
		},
		{
			name: "composerActions",
			type: "ReactNode",
			required: false,
			description: "Trailing slot inside the composer — typically a Send button.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root.",
		},
	],
	variants: [],
	slots: [
		{
			name: "composerActions",
			description: "Trailing children passed into the underlying `<Composer>` — render Send button, attachment buttons, etc.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge", "@radix-ui/react-collapsible", "class-variance-authority"],
		internal: [
			"lib/utils",
			"components/composer/composer",
			"components/message/message",
			"components/message-list/message-list",
			"components/shimmer/shimmer",
			"components/sources/sources",
		],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "border", "muted", "muted-foreground", "background", "secondary", "accent", "ring"],
	examples: [
		{
			title: "Off-the-shelf chat surface",
			description: "Pass a messages array + onSubmit handler. Internal composer state is managed for you.",
			code: 'const [messages, setMessages] = useState<ConversationMessage[]>([]);\nfunction handle(text: string) {\n  setMessages((m) => [...m, { id: nanoid(), role: "user", content: text }]);\n  // …kick off the model call\n}\n<Conversation messages={messages} onSubmit={handle} />',
			composition: ["chat", "shell", "conversation"],
		},
		{
			title: "Streaming + RAG sources",
			description: "Show a Shimmer placeholder for the in-flight assistant turn and a Sources panel when the response cites sources.",
			code: '<Conversation\n  messages={messages}\n  onSubmit={handle}\n  isStreaming={waitingForFirstToken}\n  sources={lastResponse?.sources}\n  placeholder="Ask the docs…"\n/>',
			composition: ["chat", "rag", "streaming"],
		},
		{
			title: "Markdown-formatted assistant turns",
			description: "Pass `<Markdown>` (or any node) as the message content for streaming-safe formatting.",
			code: 'const messages = chunks.map((c) => ({\n  id: c.id,\n  role: c.role,\n  content: c.role === "assistant" ? <Markdown>{c.text}</Markdown> : c.text,\n}));\n<Conversation messages={messages} onSubmit={handle} />',
			composition: ["chat", "markdown", "streaming"],
		},
	],
	ai: {
		whenToUse:
			"As the off-the-shelf entry point for any chat surface — saves consumers from wiring `<MessageList>` + `<Composer>` + `<Sources>` + `<Shimmer>` manually. Use when the standard layout (history above, composer below) fits.",
		whenNotToUse:
			"Don't use when you need a non-standard layout (composer-on-top, side-by-side branches, threaded sub-conversations) — drop down to the underlying primitives. Don't use for a single-shot prompt UI (just a Composer + a result panel).",
		commonMistakes: [
			"Passing message strings as `content` when you wanted markdown rendering — wrap with `<Markdown>{text}</Markdown>` so streaming-safe formatting kicks in",
			"Forgetting the `id` field on each ConversationMessage — without a stable id React re-mounts every row on each update, killing input focus and animation continuity",
			"Passing `value` without `onValueChange` (or vice-versa) — controlled mode requires both props together; without the handler, the input goes read-only because internal state can't update",
			"Setting `isStreaming` for the entire response — only set it during the dead time BEFORE the first token; once tokens arrive, render the partial in the messages array and clear isStreaming",
		],
		relatedComponents: ["message-list", "composer", "message", "sources", "shimmer", "markdown"],
		accessibilityNotes:
			"Inherits accessibility from each composed primitive: MessageList is a `role=\"log\"` with `aria-live=\"polite\"` so new turns announce, Composer's textarea is a labelled form input that submits on Enter, Sources is a labelled Collapsible, and Shimmer is `role=\"status\"`. The composer disables cleanly via the `disabled` prop, propagating to its `<textarea>`.",
		tokenBudget: 1429,
	},
	tags: ["ai", "chat", "shell", "conversation", "messages", "composer"],
};
