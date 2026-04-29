"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Multi-line text input + submission shell for chat composers. Headless on
 * data flow — `value`/`onValueChange` are required so the consumer keeps
 * input state wherever fits (a `useChat` hook, a parent form, local state).
 *
 * Submits on Enter (without Shift). Children render after the textarea —
 * the canonical place for attachment buttons + a send button.
 *
 * Spreads remaining props onto the underlying `<form>`, so consumers can
 * pass `aria-label`, `id`, `name`, `data-*`, and similar attributes.
 *
 * @example
 * <Composer
 *   value={input}
 *   onValueChange={setInput}
 *   onSubmit={(v) => sendMessage(v)}
 *   placeholder="Ask anything…"
 * >
 *   <Button type="submit">Send</Button>
 * </Composer>
 */
export interface ComposerProps
	extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children"> {
	value: string;
	onValueChange: (value: string) => void;
	onSubmit: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	/** Submit on Enter without Shift. Default true. */
	submitOnEnter?: boolean;
	/** Accessible name for the textarea. Defaults to `placeholder` when set, else "Message". */
	textareaAriaLabel?: string;
	/** Trailing slot — attachment buttons, send button, etc. */
	children?: React.ReactNode;
}

/**
 * Renders a chat composer with a textarea + slot for action buttons.
 * @param props - controlled value/handlers + slot children
 * @returns A form element with a textarea and trailing slot
 */
function Composer({
	value,
	onValueChange,
	onSubmit,
	disabled,
	placeholder,
	submitOnEnter = true,
	textareaAriaLabel,
	children,
	className,
	...rest
}: ComposerProps) {
	function trySubmit() {
		const trimmed = value.trim();
		if (!trimmed || disabled) return;
		onSubmit(trimmed);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (!submitOnEnter) return;
		if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			trySubmit();
		}
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		trySubmit();
	}

	return (
		<form
			{...rest}
			onSubmit={handleSubmit}
			className={cn(
				"flex items-end gap-2 rounded-lg border bg-background p-2",
				"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
				"transition-all duration-[var(--duration-normal,200ms)] ease-out",
				className,
			)}
		>
			<textarea
				value={value}
				onChange={(event) => onValueChange(event.target.value)}
				onKeyDown={handleKeyDown}
				disabled={disabled}
				placeholder={placeholder}
				aria-label={textareaAriaLabel ?? placeholder ?? "Message"}
				rows={1}
				className={cn(
					"flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-6",
					"placeholder:text-muted-foreground focus:outline-none",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"max-h-48 min-h-[2.25rem] overflow-y-auto",
				)}
			/>
			{children}
		</form>
	);
}

export { Composer };
