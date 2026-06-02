"use client";

import * as React from "react";
import { useChat as useSDKChat } from "@ai-sdk/react";
import type { Role } from "../../ai/types.js";
import type {
	ChatComposerSlice,
	ChatStatus,
	HexUIMessage,
	UseAIChatOptions,
	UseAIChatReturn,
} from "../types.js";

/**
 * Options accepted by {@link useAIChat}. Extends the shared {@link UseAIChatOptions}
 * with the only AI-SDK-specific knob we expose at V1: the chat endpoint URL.
 * Pass any other SDK option through `sdkOptions` until we promote it.
 */
export interface UseAIChatHookOptions extends UseAIChatOptions {
	/** Chat endpoint URL. Defaults to `/api/chat` per AI SDK convention. */
	api?: string;
	/** Escape hatch for AI SDK options not yet promoted to the public surface. */
	sdkOptions?: Record<string, unknown>;
}

const COMPATIBLE_ROLES: ReadonlySet<Role> = new Set([
	"user",
	"assistant",
	"system",
	"tool",
]);

/** Narrow an unknown SDK role to Hex's {@link Role} enum, falling back to `assistant`. */
function narrowRole(role: unknown): Role {
	return typeof role === "string" && COMPATIBLE_ROLES.has(role as Role)
		? (role as Role)
		: "assistant";
}

/** Extract concatenated text from AI SDK v5 `UIMessage.parts`. */
function extractText(parts: unknown): string {
	if (!Array.isArray(parts)) return "";
	let out = "";
	for (const part of parts) {
		if (
			typeof part === "object" &&
			part !== null &&
			(part as { type?: unknown }).type === "text" &&
			typeof (part as { text?: unknown }).text === "string"
		) {
			out += (part as { text: string }).text;
		}
	}
	return out;
}

/**
 * SDK-agnostic chat adapter. Thin wrapper around AI SDK v5's `useChat` that:
 *
 *   - Normalizes message role to Hex's {@link Role} enum.
 *   - Concatenates text parts into a `content` string for the default
 *     `<Message>` render path while preserving `parts` for advanced rendering.
 *   - Manages local input state (AI SDK v5 no longer owns this) and exposes
 *     it as a `composer` slice that spreads directly onto `<Composer>`.
 *   - Maps `regenerate()` → `reload()` so the public surface matches Phase 1's
 *     `MessageActions` convention.
 *
 * Future LangChain / Mastra adapters will ship as sibling files and return
 * the same {@link UseAIChatReturn} contract — `chat.composer` always works.
 */
export function useAIChat(options: UseAIChatHookOptions = {}): UseAIChatReturn {
	const [value, setValue] = React.useState("");

	// AI SDK v5's `useChat` accepts either `{ chat }` or inline `ChatInit`. We
	// pass only `api` from inline init for V1; consumers needing onError /
	// onFinish / messages will wire those through `sdkOptions` until we
	// promote them.
	const sdkOptions = options.sdkOptions ?? {};
	const sdk = useSDKChat({
		...sdkOptions,
		...(options.api ? { api: options.api } : {}),
		...(options.initialMessages
			? { messages: options.initialMessages as unknown as never }
			: {}),
	} as never);

	const status: ChatStatus = (() => {
		const s = (sdk as { status?: unknown }).status;
		if (s === "submitted" || s === "streaming" || s === "error" || s === "ready") {
			return s;
		}
		return "ready";
	})();

	const sdkMessages = (sdk as { messages?: ReadonlyArray<unknown> }).messages;

	const messages: ReadonlyArray<HexUIMessage> = React.useMemo(() => {
		if (!Array.isArray(sdkMessages)) return [];
		return sdkMessages.map((m) => {
			const msg = m as { id?: unknown; role?: unknown; parts?: unknown };
			return {
				id: typeof msg.id === "string" ? msg.id : "",
				role: narrowRole(msg.role),
				content: extractText(msg.parts),
				parts: Array.isArray(msg.parts) ? (msg.parts as ReadonlyArray<unknown>) : undefined,
			};
		});
	}, [sdkMessages]);

	const sendMessage = (sdk as { sendMessage?: (msg: unknown) => unknown }).sendMessage;
	const stop = (sdk as { stop?: () => void }).stop;
	const regenerate = (sdk as { regenerate?: () => void }).regenerate;
	const error = (sdk as { error?: Error | undefined }).error;

	const composer: ChatComposerSlice = React.useMemo(
		() => ({
			value,
			onValueChange: setValue,
			onSubmit: (next: string) => {
				const trimmed = next.trim();
				if (!trimmed) return;
				sendMessage?.({ text: trimmed });
				setValue("");
			},
			disabled: status === "submitted" || status === "streaming",
		}),
		[value, sendMessage, status],
	);

	return {
		messages,
		status,
		composer,
		stop: () => stop?.(),
		reload: () => regenerate?.(),
		error,
	};
}
