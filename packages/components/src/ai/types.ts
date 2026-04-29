/**
 * Shared type primitives for the `ai` component category. Kept SDK-agnostic
 * so a single `MessageProps`/`ToolCallProps` shape adapts to AI SDK
 * (`UIMessage.parts`), LangChain (`BaseMessage`), Mastra agent outputs, and
 * any custom backend with a thin caller-side mapping function.
 */

/** Speaker of a message. Matches AI SDK + LangChain role conventions. */
export type Role = "user" | "assistant" | "system" | "tool";

/**
 * Lifecycle of a tool/function invocation, surfaced as the `state` prop on
 * `ToolCall`. `pending` = queued, `running` = executing, `result` = returned
 * a value, `error` = threw. Picked to align with AI SDK v5 `tool-*` parts.
 */
export type ToolCallState = "pending" | "running" | "result" | "error";
