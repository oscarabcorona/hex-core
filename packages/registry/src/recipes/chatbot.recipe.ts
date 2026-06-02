import type { RecipeDefinition } from "../recipe-schema.js";

export const chatbotRecipe: RecipeDefinition = {
	slug: "chatbot",
	title: "Chatbot",
	summary:
		"Streaming chatbot that wires the Phase 3 useAIChat hook to a server endpoint, renders each turn as a <Message> with streaming-safe <Markdown>, shows a typing indicator during the dead time before the first token, and offers per-bubble retry via useStreamingMessage. The end-to-end proof that the AI Kit hooks compose with the primitives into a working chat UI.",
	tags: ["ai", "chat", "chatbot", "streaming", "ai-sdk", "hook", "markdown"],
	brief:
		"Build a streaming chatbot. Call useAIChat({ api: '/api/chat' }) in a client component, spread chat.composer onto <Composer>, and iterate chat.messages into <Message> bubbles inside a <MessageList>. Render assistant turns through <Markdown> so partial streamed text stays valid. Show a <LoadingIndicator> while chat.status === 'submitted' (before the first token). Use useStreamingMessage(chat, id) per assistant bubble for an isStreaming flag and a retry handle. Back it with a Next.js POST /api/chat route that returns streamText(...).toUIMessageStreamResponse(). For a no-frills version, the <Conversation> shell wraps MessageList + Composer + a streaming shimmer in one component — feed it chat.messages and chat.composer instead of hand-wiring. Install deps: ai + an SDK provider (e.g. @ai-sdk/openai) for the route; @ai-sdk/react is the heavyPeer behind useAIChat.",
	steps: [
		{
			component: "use-ai-chat",
			reason: "Connects the UI to the streaming endpoint and normalizes messages + composer state",
			role: "primary",
		},
		{
			component: "use-streaming-message",
			reason: "Per-bubble isStreaming flag plus abort/retry handles tied to one assistant turn",
			role: "supporting",
		},
		{
			component: "message-list",
			reason: "Scrolling transcript with auto-scroll and an ARIA live region",
			role: "primary",
		},
		{
			component: "message",
			reason: "Renders one chat turn, styled by role",
			role: "primary",
		},
		{
			component: "markdown",
			reason: "Streaming-safe rendering of assistant text — closes unterminated fences mid-stream",
			role: "supporting",
		},
		{
			component: "composer",
			reason: "Input row; receives the chat.composer slice via spread",
			role: "primary",
		},
		{
			component: "loading-indicator",
			reason: "Typing dots during the dead time before the first streamed token",
			role: "optional",
		},
	],
	checklist: [
		{
			id: "streaming-endpoint",
			check:
				"Back the hook with a streaming POST /api/chat route returning streamText(...).toUIMessageStreamResponse(). A plain JSON response leaves chat.status stuck on 'submitted' and nothing ever renders.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "assistant-via-markdown",
			check:
				"Render assistant content through <Markdown>, not raw {message.content}. Raw text drops code blocks and formatting; <Markdown> is the streaming-safe path that closes unterminated fences.",
			severity: "warn",
			source: "author",
		},
		{
			id: "indicator-on-submitted-only",
			check:
				"Gate the standalone <LoadingIndicator> on status === 'submitted'. Once status is 'streaming' the partial assistant bubble already renders, so a second indicator double-counts the in-flight turn.",
			severity: "warn",
			source: "author",
		},
		{
			id: "spread-composer-whole",
			check:
				"Spread the whole {...chat.composer} slice onto <Composer>. Cherry-picking value/onSubmit but dropping disabled leaves the input editable mid-stream.",
			severity: "warn",
			source: "author",
		},
		{
			id: "stable-message-key",
			check:
				"Key each <Message> on message.id from the hook, never the array index — streaming appends/replaces turns and index keys remount the wrong bubbles.",
			severity: "nit",
			source: "author",
		},
	],
	example: `// app/chatbot.tsx
"use client";

import {
  useAIChat,
  useStreamingMessage,
  type UseAIChatReturn,
  MessageList,
  Message,
  Markdown,
  Composer,
  MessageActions,
  LoadingIndicator,
} from "@hex-core/components";
import { Button } from "@/components/ui/button";

export function Chatbot() {
  const chat = useAIChat({ api: "/api/chat" });

  return (
    <div className="flex h-[600px] flex-col gap-4">
      <MessageList className="flex-1">
        {chat.messages.map((message) => (
          <ChatBubble key={message.id} chat={chat} messageId={message.id} />
        ))}
      </MessageList>

      {/* Sibling of MessageList, not a child — keeps the role="log" region
          free of non-Message nodes and avoids nesting two live regions. */}
      {chat.status === "submitted" ? (
        <LoadingIndicator variant="dots" label="Thinking…" />
      ) : null}

      <Composer {...chat.composer} placeholder="Ask anything…" />
    </div>
  );
}

function ChatBubble({ chat, messageId }: { chat: UseAIChatReturn; messageId: string }) {
  const { message, isStreaming, retry } = useStreamingMessage(chat, messageId);
  if (!message) return null;

  const isAssistant = message.role === "assistant";

  return (
    <Message role={message.role}>
      {isAssistant ? <Markdown>{message.content}</Markdown> : message.content}
      {isAssistant && !isStreaming ? (
        <MessageActions>
          <Button variant="ghost" size="sm" onClick={retry}>
            Retry
          </Button>
        </MessageActions>
      ) : null}
    </Message>
  );
}

// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}`,
	tokenBudget: 2800,
};
