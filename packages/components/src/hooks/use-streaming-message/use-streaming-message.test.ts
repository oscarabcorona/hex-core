import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatStatus, HexUIMessage, UseAIChatReturn } from "../types.js";
import { useStreamingMessage } from "./use-streaming-message.js";

function makeChat(
	messages: ReadonlyArray<HexUIMessage>,
	status: ChatStatus,
): UseAIChatReturn {
	return {
		messages,
		status,
		composer: { value: "", onValueChange: vi.fn(), onSubmit: vi.fn(), disabled: false },
		stop: vi.fn(),
		reload: vi.fn(),
		error: undefined,
	};
}

const userMsg: HexUIMessage = { id: "u1", role: "user", content: "hi" };
const assistantA: HexUIMessage = { id: "a1", role: "assistant", content: "first" };
const assistantB: HexUIMessage = { id: "a2", role: "assistant", content: "second" };

describe("useStreamingMessage", () => {
	it("returns the matched message", () => {
		const chat = makeChat([userMsg, assistantA], "ready");
		const { result } = renderHook(() => useStreamingMessage(chat, "u1"));
		expect(result.current.message).toBe(userMsg);
	});

	it("returns undefined when no message matches", () => {
		const chat = makeChat([userMsg], "ready");
		const { result } = renderHook(() => useStreamingMessage(chat, "missing"));
		expect(result.current.message).toBeUndefined();
		expect(result.current.isStreaming).toBe(false);
	});

	it("flags the LAST assistant message as streaming while submitted/streaming", () => {
		const chat = makeChat([userMsg, assistantA, assistantB], "streaming");
		const { result: lastAssistant } = renderHook(() =>
			useStreamingMessage(chat, "a2"),
		);
		const { result: olderAssistant } = renderHook(() =>
			useStreamingMessage(chat, "a1"),
		);
		const { result: userBubble } = renderHook(() => useStreamingMessage(chat, "u1"));
		expect(lastAssistant.current.isStreaming).toBe(true);
		expect(olderAssistant.current.isStreaming).toBe(false);
		expect(userBubble.current.isStreaming).toBe(false);
	});

	it("never flags streaming while status is ready/error", () => {
		const ready = makeChat([assistantA], "ready");
		const errored = makeChat([assistantA], "error");
		const { result: r1 } = renderHook(() => useStreamingMessage(ready, "a1"));
		const { result: r2 } = renderHook(() => useStreamingMessage(errored, "a1"));
		expect(r1.current.isStreaming).toBe(false);
		expect(r2.current.isStreaming).toBe(false);
	});

	it("exposes abort and retry as wrappers over chat.stop / chat.reload", () => {
		const chat = makeChat([assistantA], "streaming");
		const { result } = renderHook(() => useStreamingMessage(chat, "a1"));
		result.current.abort();
		result.current.retry();
		expect(chat.stop).toHaveBeenCalledTimes(1);
		expect(chat.reload).toHaveBeenCalledTimes(1);
	});
});
