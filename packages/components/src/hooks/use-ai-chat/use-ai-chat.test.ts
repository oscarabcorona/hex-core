import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const sendMessageSpy = vi.fn();
const stopSpy = vi.fn();
const regenerateSpy = vi.fn();

let mockSdkReturn: Record<string, unknown> = {
	id: "chat-1",
	messages: [],
	status: "ready",
	error: undefined,
	sendMessage: sendMessageSpy,
	stop: stopSpy,
	regenerate: regenerateSpy,
	setMessages: vi.fn(),
	clearError: vi.fn(),
};

vi.mock("@ai-sdk/react", () => ({
	useChat: () => mockSdkReturn,
}));

import { useAIChat } from "./use-ai-chat.js";

afterEach(() => {
	sendMessageSpy.mockClear();
	stopSpy.mockClear();
	regenerateSpy.mockClear();
	mockSdkReturn = {
		id: "chat-1",
		messages: [],
		status: "ready",
		error: undefined,
		sendMessage: sendMessageSpy,
		stop: stopSpy,
		regenerate: regenerateSpy,
		setMessages: vi.fn(),
		clearError: vi.fn(),
	};
});

describe("useAIChat", () => {
	it("starts with empty messages, ready status, and an empty composer", () => {
		const { result } = renderHook(() => useAIChat());
		expect(result.current.messages).toEqual([]);
		expect(result.current.status).toBe("ready");
		expect(result.current.composer.value).toBe("");
		expect(result.current.composer.disabled).toBe(false);
		expect(result.current.error).toBeUndefined();
	});

	it("updates composer.value through onValueChange", () => {
		const { result } = renderHook(() => useAIChat());
		act(() => result.current.composer.onValueChange("hello"));
		expect(result.current.composer.value).toBe("hello");
	});

	it("calls sendMessage with { text } on submit and clears the composer", () => {
		const { result } = renderHook(() => useAIChat());
		act(() => result.current.composer.onValueChange("hi"));
		act(() => result.current.composer.onSubmit("hi"));
		expect(sendMessageSpy).toHaveBeenCalledTimes(1);
		expect(sendMessageSpy).toHaveBeenCalledWith({ text: "hi" });
		expect(result.current.composer.value).toBe("");
	});

	it("trims input and skips submit when the trimmed value is empty", () => {
		const { result } = renderHook(() => useAIChat());
		act(() => result.current.composer.onSubmit("   "));
		expect(sendMessageSpy).not.toHaveBeenCalled();
	});

	it("disables the composer while submitted or streaming", () => {
		mockSdkReturn.status = "streaming";
		const { result } = renderHook(() => useAIChat());
		expect(result.current.composer.disabled).toBe(true);
		expect(result.current.status).toBe("streaming");
	});

	it("normalizes message role to Role enum and concatenates text parts into content", () => {
		mockSdkReturn.messages = [
			{
				id: "m1",
				role: "user",
				parts: [{ type: "text", text: "hello " }, { type: "text", text: "world" }],
			},
			{
				id: "m2",
				role: "assistant",
				parts: [
					{ type: "text", text: "hi" },
					{ type: "tool-call", toolName: "search" },
				],
			},
			{ id: "m3", role: "unknown-role", parts: [{ type: "text", text: "x" }] },
		];
		const { result } = renderHook(() => useAIChat());
		expect(result.current.messages).toHaveLength(3);
		expect(result.current.messages[0]).toMatchObject({
			id: "m1",
			role: "user",
			content: "hello world",
		});
		expect(result.current.messages[1]).toMatchObject({
			id: "m2",
			role: "assistant",
			content: "hi",
		});
		expect(result.current.messages[1]?.parts).toHaveLength(2);
		expect(result.current.messages[2]?.role).toBe("assistant");
	});

	it("maps regenerate → reload and surfaces stop", () => {
		const { result } = renderHook(() => useAIChat());
		act(() => result.current.reload());
		act(() => result.current.stop());
		expect(regenerateSpy).toHaveBeenCalledTimes(1);
		expect(stopSpy).toHaveBeenCalledTimes(1);
	});

	it("passes the error through unchanged", () => {
		const err = new Error("boom");
		mockSdkReturn.status = "error";
		mockSdkReturn.error = err;
		const { result } = renderHook(() => useAIChat());
		expect(result.current.status).toBe("error");
		expect(result.current.error).toBe(err);
	});
});
