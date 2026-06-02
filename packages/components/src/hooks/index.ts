/**
 * AI Kit hooks. SDK-agnostic primitives that drive Phase 1 components.
 *
 * - {@link useAIChat} — top-level chat state. Spreads onto `<Composer>`.
 * - {@link useStreamingMessage} — per-message helper for loading + abort.
 *
 * Schemas live in `./schemas/` and are registered by `scripts/build-registry.ts`
 * via SCHEMA_ONLY_ROOTS (the runtime ships from `@hex-core/components`, no
 * source-copy at install time — mirrors the `@hex-core/motion` hook pattern).
 */
export { useAIChat } from "./use-ai-chat/use-ai-chat.js";
export type { UseAIChatHookOptions } from "./use-ai-chat/use-ai-chat.js";
export { useStreamingMessage } from "./use-streaming-message/use-streaming-message.js";
export type { UseStreamingMessageReturn } from "./use-streaming-message/use-streaming-message.js";
export type {
	ChatComposerSlice,
	ChatStatus,
	HexUIMessage,
	UseAIChatOptions,
	UseAIChatReturn,
} from "./types.js";
