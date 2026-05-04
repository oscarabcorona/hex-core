"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * Headless alternate-response navigator. Renders the active branch
 * (`children`) with a prev/next control chip beneath it. Stateless —
 * the consumer owns `current` (zero-indexed) and `total`.
 *
 * Keyboard: ArrowLeft / ArrowRight step through branches when focus
 * lives anywhere inside the group (the wrapper itself is not focusable;
 * the prev/next buttons or any focusable descendant carry the keys).
 * Read-only when `onCurrentChange` is omitted.
 *
 * @example
 * <Branch current={index} total={alternatives.length} onCurrentChange={setIndex}>
 *   <Message role="assistant">
 *     <Markdown>{alternatives[index]}</Markdown>
 *   </Message>
 * </Branch>
 */
export interface BranchProps {
	/** Zero-indexed active branch. */
	current: number;
	/** Total number of branches. */
	total: number;
	/** Optional change handler — when omitted, the controls render disabled. */
	onCurrentChange?: (next: number) => void;
	/** The active branch content (typically a `<Message>` or `<Markdown>`). */
	children: React.ReactNode;
	/** Override the accessible label for the navigator landmark. */
	"aria-label"?: string;
	className?: string;
}

/**
 * Render a single-active-branch navigator with prev/next controls.
 * @param props - current/total + change handler + body
 * @returns A nav landmark wrapping the active branch and a control chip
 */
function Branch({
	current,
	total,
	onCurrentChange,
	children,
	"aria-label": ariaLabel = "Response branches",
	className,
}: BranchProps) {
	const interactive = typeof onCurrentChange === "function";
	const atFirst = current <= 0;
	const atLast = current >= total - 1;

	function go(delta: number) {
		if (!interactive) return;
		const next = current + delta;
		if (next < 0 || next > total - 1) return;
		onCurrentChange(next);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
		if (!interactive) return;
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			go(-1);
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			go(1);
		}
	}

	return (
		<div
			role="group"
			aria-label={ariaLabel}
			onKeyDown={handleKeyDown}
			className={cn("flex flex-col gap-2", className)}
		>
			<div>{children}</div>
			<div className="flex items-center justify-end gap-1">
				<button
					type="button"
					aria-label="Previous response"
					disabled={!interactive || atFirst}
					onClick={() => go(-1)}
					className={cn(
						"inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground",
						"transition-all duration-[var(--duration-normal,200ms)] ease-out",
						"hover:bg-muted hover:text-foreground",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						"disabled:pointer-events-none disabled:opacity-40",
					)}
				>
					<ChevronLeft />
				</button>
				<span
					/*
					 * Live-region only when the consumer wired up navigation —
					 * read-only branches don't change, so announcing every
					 * mount would be noise in a chat surface with many
					 * <Branch> blocks. aria-atomic ensures the chip reads as
					 * one unit ("2 of 3") rather than two diff'd numbers.
					 */
					aria-live={interactive ? "polite" : undefined}
					aria-atomic="true"
					className="select-none px-1 text-xs tabular-nums text-muted-foreground"
				>
					{current + 1} of {total}
				</span>
				<button
					type="button"
					aria-label="Next response"
					disabled={!interactive || atLast}
					onClick={() => go(1)}
					className={cn(
						"inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground",
						"transition-all duration-[var(--duration-normal,200ms)] ease-out",
						"hover:bg-muted hover:text-foreground",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						"disabled:pointer-events-none disabled:opacity-40",
					)}
				>
					<ChevronRight />
				</button>
			</div>
		</div>
	);
}

function ChevronLeft() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M10 4l-4 4 4 4" />
		</svg>
	);
}

function ChevronRight() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M6 4l4 4-4 4" />
		</svg>
	);
}

export { Branch };
