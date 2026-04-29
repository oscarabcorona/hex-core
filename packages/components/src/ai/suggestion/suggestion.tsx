"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Prompt pill / quick-action chip. Click forwards `value` (or the rendered
 * string children) to `onSelect` — typically wired to drop the suggestion
 * into a `Composer` or fire it directly through `useChat.append`.
 *
 * Stateless: no submission logic, no networking. Composer (or its parent)
 * decides whether `onSelect` populates the input or auto-sends.
 *
 * @example
 * <Cluster gap="sm">
 *   {prompts.map((p) => (
 *     <Suggestion key={p} value={p} onSelect={setInput}>{p}</Suggestion>
 *   ))}
 * </Cluster>
 */
export interface SuggestionProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect" | "value"> {
	/** Payload passed to `onSelect`. Defaults to the rendered children if a string. */
	value?: string;
	onSelect: (value: string) => void;
	children: React.ReactNode;
}

/**
 * Renders a clickable suggestion chip.
 * @param props - value/onSelect + children
 * @returns A styled button element
 */
function Suggestion({
	value,
	onSelect,
	children,
	className,
	type = "button",
	onClick,
	...props
}: SuggestionProps) {
	function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
		const payload = value ?? extractText(children);
		onSelect(payload);
		onClick?.(event);
	}

	return (
		<button
			type={type}
			onClick={handleClick}
			className={cn(
				"inline-flex items-center rounded-full border border-foreground/15 bg-background px-3 py-1.5 text-sm",
				"transition-all duration-[var(--duration-normal,200ms)] ease-out",
				"hover:border-foreground/30 hover:bg-secondary/40 hover:shadow-sm",
				"active:scale-[0.98]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

/**
 * Recursively pull plain-text out of a ReactNode tree so a `<Suggestion>`
 * with JSX children (e.g. `<Icon /> Try this`) still resolves to the
 * visible label when no `value` prop was set.
 *
 * @param node - children ReactNode
 * @returns The concatenated text content, trimmed of incidental whitespace
 */
function extractText(node: React.ReactNode): string {
	if (node == null || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(extractText).join(" ").replace(/\s+/g, " ").trim();
	if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
		return extractText(node.props.children);
	}
	return "";
}

export { Suggestion };
