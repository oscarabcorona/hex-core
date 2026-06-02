/**
 * SDK-agnostic public surface of the `useAIChat` adapter family. Concrete
 * adapters (AI SDK v5, future LangChain / Mastra) all return values matching
 * these contracts so consumers wire the same `<Composer {...chat.composer} />`
 * and `<Message role={m.role}>` regardless of which engine they use.
 */

import type { Role } from "../ai/types.js";

/**
 * One message, normalized across SDKs.
 *
 * `parts` is passed through untouched so consumers that want to render tool
 * calls or reasoning blocks can iterate the original SDK shape. `content` is a
 * convenience — the concatenated text of every text part, suitable for the
 * default `<Message>` body.
 */
export interface HexUIMessage {
	id: string;
	role: Role;
	/** Concatenated text content. Empty string if the message has no text parts. */
	content: string;
	/** Underlying SDK parts (pass-through for advanced rendering). */
	parts?: ReadonlyArray<unknown>;
}

/**
 * Lifecycle of the active chat request. Matches AI SDK v5's `ChatStatus`
 * verbatim so adapters can pass it through; LangChain / Mastra adapters
 * map their states onto the same four values.
 *
 * - `ready` — no request in flight, accepting input.
 * - `submitted` — request sent, waiting for first token.
 * - `streaming` — receiving tokens.
 * - `error` — last request failed; consumer should surface the error and
 *   offer a retry (`reload()`).
 */
export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

/**
 * The slice of `useAIChat`'s return that maps directly onto `<Composer>`'s
 * props. Spread it: `<Composer {...chat.composer} />`.
 */
export interface ChatComposerSlice {
	value: string;
	onValueChange: (value: string) => void;
	onSubmit: (value: string) => void;
	disabled: boolean;
}

/** Return type of `useAIChat` (and every future SDK adapter). */
export interface UseAIChatReturn {
	messages: ReadonlyArray<HexUIMessage>;
	status: ChatStatus;
	composer: ChatComposerSlice;
	/** Abort the in-flight request. No-op when idle. */
	stop: () => void;
	/** Regenerate the last assistant message. */
	reload: () => void;
	/** Last error, if `status === "error"`. */
	error: Error | undefined;
}

/** Options accepted by every adapter. SDK-specific options are passed inline. */
export interface UseAIChatOptions {
	/** Initial message list — useful for restoring conversations. */
	initialMessages?: ReadonlyArray<HexUIMessage>;
}
