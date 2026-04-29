"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

const RESET_DELAY_MS = 1500;

/**
 * Copy-to-clipboard button for the `CodeBlock` header. Lives in a
 * client-only file so the surrounding `CodeBlock` (an async Server
 * Component) can render server-side while this island hydrates on the
 * client for `navigator.clipboard` access.
 *
 * @example
 * <CodeBlockCopy code={code} />
 */
export interface CodeBlockCopyProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** The code text to copy. Must be plain text (not the highlighted HTML). */
	code: string;
}

/**
 * Renders the copy button. Switches to a check icon for ~1.5s after a
 * successful copy.
 *
 * @param props - the raw code string
 * @returns A button that copies on click
 */
type CopyState = "idle" | "copied" | "error";

function CodeBlockCopy({ code, className, ...props }: CodeBlockCopyProps) {
	const [state, setState] = React.useState<CopyState>("idle");

	React.useEffect(() => {
		if (state === "idle") return;
		const id = window.setTimeout(() => setState("idle"), RESET_DELAY_MS);
		return () => window.clearTimeout(id);
	}, [state]);

	async function handleClick() {
		try {
			await navigator.clipboard.writeText(code);
			setState("copied");
		} catch {
			setState("error");
		}
	}

	const ariaLabel =
		state === "copied" ? "Copied" : state === "error" ? "Copy failed" : "Copy code";

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label={ariaLabel}
			title={ariaLabel}
			className={cn(
				"inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground",
				"transition-all duration-[var(--duration-normal,200ms)] ease-out",
				"hover:bg-foreground/10 hover:text-foreground",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
			{...props}
		>
			{state === "copied" ? <CheckGlyph /> : state === "error" ? <ErrorGlyph /> : <CopyGlyph />}
		</button>
	);
}

function CopyGlyph() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="13"
			height="13"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="5" y="5" width="9" height="9" rx="1.5" />
			<path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
		</svg>
	);
}

function CheckGlyph() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="13"
			height="13"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-emerald-500"
		>
			<path d="M3 8l3.5 3.5L13 5" />
		</svg>
	);
}

function ErrorGlyph() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="13"
			height="13"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-destructive"
		>
			<circle cx="8" cy="8" r="6.5" />
			<path d="M8 5v3.5M8 11v.01" />
		</svg>
	);
}

export { CodeBlockCopy };
