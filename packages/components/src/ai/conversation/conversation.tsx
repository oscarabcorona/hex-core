"use client";

import * as React from "react";
import { Composer } from "../composer/composer.js";
import { Message } from "../message/message.js";
import { MessageList } from "../message-list/message-list.js";
import { Shimmer } from "../shimmer/shimmer.js";
import { Sources, type SourceRef } from "../sources/sources.js";
import { cn } from "../../lib/utils.js";

// Local ambient — bundlers (Next, Vite, tsup) replace `process.env.NODE_ENV`
// at build time. Avoids pulling @types/node into the components package just
// for the controlled-mode dev-warning. Same pattern as slider.tsx.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

/**
 * Speaker of a message. Mirrors the canonical `Role` union from
 * `@hex-core/components` exactly — kept inline (rather than imported
 * from `../types.js`) so the registry CLI distribution path (`npx hex
 * add conversation`) ships a self-contained file. Same precedent as
 * `task.tsx`'s inlined `ToolCallState`. The build-registry script
 * doesn't bundle `types.ts`, so importing from it would leave consumer
 * TS strict-mode unable to resolve the type at the install location.
 */
type Role = "user" | "assistant" | "system" | "tool";

/**
 * High-level chat shell. Composes `<MessageList>` over `messages`, an
 * optional `<Sources>` panel beneath the latest assistant turn, an
 * optional `<Shimmer>` placeholder for the in-flight assistant response,
 * and a `<Composer>` row at the bottom.
 *
 * Presentational: the consumer owns the `messages` array and the
 * `onSubmit` handler. The composer's text state is internal by default
 * so simple consumers don't thread input plumbing; pass `value` +
 * `onValueChange` together to take full control (suggested-prompt
 * injection, voice transcription, form-library integration).
 *
 * @example
 * <Conversation
 *   messages={messages}
 *   onSubmit={(text) => sendMessage(text)}
 *   isStreaming={isWaitingForFirstToken}
 *   sources={lastResponse.sources}
 *   placeholder="Ask anything…"
 * />
 */
export interface ConversationProps {
	/** Ordered chat history. Each item renders as one `<Message>`. */
	messages: ConversationMessage[];
	/** Called with the trimmed text when the user submits the composer. */
	onSubmit: (text: string) => void;
	/** Composer placeholder. */
	placeholder?: string;
	/** Controlled composer text. Pass with `onValueChange` to take control of the input — useful for suggested prompts, voice transcripts, or form-library integration. */
	value?: string;
	/** Called whenever the composer text changes. Required when `value` is set. */
	onValueChange?: (value: string) => void;
	/** When true, render a `<Shimmer>` placeholder above the composer (use during the dead time before the first stream token). */
	isStreaming?: boolean;
	/** Optional citations rendered as a `<Sources>` panel beneath the message stream. */
	sources?: SourceRef[];
	/** Disable the composer (e.g. while waiting on a tool call). */
	disabled?: boolean;
	/** Trailing slot inside the composer — typically a Send button. */
	composerActions?: React.ReactNode;
	className?: string;
}

/** A single message in a `<Conversation>`. */
export interface ConversationMessage {
	/** Stable identifier — used for the React key. */
	id: string;
	/** Speaker. */
	role: Role;
	/** Message content. Pass a string for plain text or a node (e.g. `<Markdown>`) for formatted output. */
	content: React.ReactNode;
}

/**
 * Render a chat conversation shell.
 * @param props - messages + submit handler + optional streaming/sources state
 * @returns A flex column with a scrolling message list, optional sources/shimmer, and a composer row
 */
function Conversation({
	messages,
	onSubmit,
	placeholder = "Ask anything…",
	value: valueProp,
	onValueChange: onValueChangeProp,
	isStreaming = false,
	sources,
	disabled = false,
	composerActions,
	className,
}: ConversationProps) {
	const [internalValue, setInternalValue] = React.useState("");
	const isControlled = valueProp !== undefined;
	const value = isControlled ? valueProp : internalValue;
	const setValue = isControlled
		? (next: string) => onValueChangeProp?.(next)
		: setInternalValue;

	if (
		typeof process !== "undefined" &&
		process.env?.NODE_ENV !== "production" &&
		isControlled &&
		typeof onValueChangeProp !== "function"
	) {
		// Surface the controlled-mode contract at runtime — `value` without
		// `onValueChange` makes the textarea silently read-only, which is a
		// frustrating debug. Schema commonMistakes flags it too, but a console
		// nudge catches it in the dev loop.
		console.warn(
			"<Conversation>: `value` was passed without `onValueChange`. The composer will be read-only — pass both props together for controlled mode, or omit both to let the component manage state internally.",
		);
	}

	function handleSubmit(text: string) {
		onSubmit(text);
		setValue("");
	}

	return (
		<div className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
			<MessageList className="min-h-0 flex-1">
				{messages.map((m) => (
					<Message key={m.id} role={m.role}>
						{m.content}
					</Message>
				))}
				{isStreaming ? (
					<Message role="assistant">
						<Shimmer width="60%" />
					</Message>
				) : null}
			</MessageList>
			{sources && sources.length > 0 ? <Sources sources={sources} /> : null}
			<Composer
				value={value}
				onValueChange={setValue}
				onSubmit={handleSubmit}
				disabled={disabled}
				placeholder={placeholder}
			>
				{composerActions}
			</Composer>
		</div>
	);
}

export { Conversation };
