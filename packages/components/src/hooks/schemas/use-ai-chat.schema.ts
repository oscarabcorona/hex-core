import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const useAIChatSchema: ComponentSchemaDefinition = {
	name: "use-ai-chat",
	displayName: "useAIChat",
	description:
		"SDK-agnostic chat adapter hook. Thin wrapper over AI SDK v5's useChat that normalizes the return shape to Hex types: message role narrowed to user/assistant/system/tool, text parts concatenated into a content string, and a composer slice that spreads directly onto <Composer>. Manages input state locally (AI SDK v5 no longer owns it). Future LangChain / Mastra adapters return the same shape.",
	category: "hook",
	subcategory: "ai",
	props: [
		{
			name: "api",
			type: "string",
			required: false,
			description:
				"Chat endpoint URL. Defaults to /api/chat per AI SDK convention.",
		},
		{
			name: "initialMessages",
			type: "object",
			required: false,
			description:
				"ReadonlyArray<HexUIMessage>. Useful for restoring conversations from server-side state.",
		},
		{
			name: "sdkOptions",
			type: "object",
			required: false,
			description:
				"Record<string, unknown>. Escape hatch for AI SDK options not yet promoted to the public surface (onError, onFinish, body, headers, etc).",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@hex-core/components"],
		internal: [],
		peer: ["react"],
		heavyPeer: [
			{
				name: "@ai-sdk/react",
				version: "^3.0.0 || ^4.0.0",
				bundleKbGzip: 18,
				reason:
					"AI SDK v5 React adapter — provides the underlying useChat hook and SSE streaming transport.",
			},
		],
	},
	tokensUsed: [],
	examples: [
		{
			title: "Minimal chatbot",
			description:
				"Wire useAIChat to Composer and MessageList. The hook owns input state, message normalization, and abort/retry handles.",
			code: `import { useAIChat, Composer, MessageList, Message } from "@hex-core/components";

function Chatbot() {
  const chat = useAIChat({ api: "/api/chat" });
  return (
    <div className="flex flex-col gap-4">
      <MessageList>
        {chat.messages.map((m) => (
          <Message key={m.id} role={m.role}>{m.content}</Message>
        ))}
      </MessageList>
      <Composer {...chat.composer} placeholder="Ask anything..." />
    </div>
  );
}`,
			composition: ["chat", "hook", "ai-sdk", "composer", "streaming"],
		},
	],
	ai: {
		whenToUse:
			"Use when wiring a chatbot UI that streams responses from a server endpoint. Spread chat.composer onto <Composer> and iterate chat.messages into <Message> bubbles. Pair with useStreamingMessage when you need per-bubble loading indicators or retry buttons.",
		whenNotToUse:
			"Don't use for non-streaming completions — useCompletion from @ai-sdk/react is closer. Don't use for stateful agent workflows that need tool approvals; that surface lands in Phase 5.",
		commonMistakes: [
			"Reading chat.messages[i].content and ignoring chat.messages[i].parts — tool calls and reasoning blocks live in parts; content only carries concatenated text.",
			"Forgetting that AI SDK v5 manages messages via sendMessage({ text }) — the hook handles this for you via composer.onSubmit. Don't call sdk.handleSubmit directly.",
			"Wiring chat.composer.disabled to your own state — the hook already disables during submitted/streaming. Layer additional checks with &&, don't replace.",
		],
		relatedComponents: ["composer", "message", "message-list", "use-streaming-message"],
		accessibilityNotes:
			"No DOM output — accessibility lives in the components this hook drives. Composer manages aria-label on the textarea; MessageList renders a live region.",
		tokenBudget: 789,
	},
	tags: ["hook", "ai", "chat", "streaming", "ai-sdk", "useAIChat"],
};
