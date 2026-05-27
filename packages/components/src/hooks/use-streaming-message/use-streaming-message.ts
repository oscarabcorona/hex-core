"use client";

import type { HexUIMessage, UseAIChatReturn } from "../types.js";

/** Return value of {@link useStreamingMessage}. */
export interface UseStreamingMessageReturn {
	/** The matched message, or undefined if no message with this id exists. */
	message: HexUIMessage | undefined;
	/**
	 * True when this message is the last assistant message AND the chat is
	 * actively streaming or just-submitted. Render a `LoadingIndicator` or
	 * blinking cursor while this is true.
	 */
	isStreaming: boolean;
	/** Abort the in-flight request. Convenience wrapper over `chat.stop()`. */
	abort: () => void;
	/** Retry the last assistant turn. Convenience wrapper over `chat.reload()`. */
	retry: () => void;
}

/**
 * Per-message helper for chat UIs. Given a chat returned by {@link useAIChat}
 * and a target message id, derive "is this one still streaming?" and
 * expose abort/retry handles so individual message bubbles can wire their
 * own LoadingIndicator + retry button without re-implementing the math.
 *
 * `isStreaming` is true only for the *last* assistant message and only while
 * the chat is in `"submitted"` or `"streaming"` state — other messages, and
 * the same message after the stream ends, return false.
 */
export function useStreamingMessage(
	chat: UseAIChatReturn,
	messageId: string,
): UseStreamingMessageReturn {
	const message = chat.messages.find((m) => m.id === messageId);

	const lastAssistant = (() => {
		for (let i = chat.messages.length - 1; i >= 0; i--) {
			if (chat.messages[i]?.role === "assistant") return chat.messages[i];
		}
		return undefined;
	})();

	const isActive = chat.status === "submitted" || chat.status === "streaming";
	const isStreaming = isActive && lastAssistant?.id === messageId;

	return {
		message,
		isStreaming,
		abort: chat.stop,
		retry: chat.reload,
	};
}
