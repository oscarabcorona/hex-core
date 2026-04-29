import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const loadingIndicatorVariants = cva("inline-flex items-center gap-2 text-muted-foreground", {
	variants: {
		size: {
			sm: "text-xs",
			md: "text-sm",
		},
	},
	defaultVariants: { size: "md" },
});

/**
 * Streaming/typing feedback for an in-flight LLM turn. Three motion variants
 * — `dots` (bouncing trio), `pulse` (single throbbing circle), `bar`
 * (horizontal sweep). Pure CSS, no JS — RSC-safe.
 *
 * @example
 * {isLoading && <LoadingIndicator label="Thinking…" />}
 */
export interface LoadingIndicatorProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof loadingIndicatorVariants> {
	/** Animation style. Default `dots`. */
	variant?: "dots" | "pulse" | "bar";
	/** Optional adjacent label, e.g. "Thinking…" or "Searching docs…". */
	label?: string;
}

/**
 * Renders an animated loading indicator with optional label.
 * @param props - variant + label
 * @returns A status div with role="status"
 */
function LoadingIndicator({
	variant = "dots",
	size,
	label,
	className,
	...props
}: LoadingIndicatorProps) {
	const ariaLabel = label ?? "Loading";
	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(loadingIndicatorVariants({ size }), className)}
			{...props}
		>
			{variant === "dots" ? <Dots /> : null}
			{variant === "pulse" ? <Pulse /> : null}
			{variant === "bar" ? <Bar /> : null}
			{label ? (
				<span aria-hidden="true">{label}</span>
			) : null}
			<span className="sr-only">{ariaLabel}</span>
		</div>
	);
}

function Dots() {
	return (
		<span className="flex items-center gap-1">
			<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
			<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
			<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
		</span>
	);
}

function Pulse() {
	return <span className="h-2 w-2 animate-pulse rounded-full bg-current" />;
}

function Bar() {
	return (
		<span className="inline-flex items-center gap-1">
			<span className="h-0.5 w-2 animate-pulse rounded-full bg-current [animation-delay:-0.4s]" />
			<span className="h-0.5 w-3 animate-pulse rounded-full bg-current [animation-delay:-0.2s]" />
			<span className="h-0.5 w-4 animate-pulse rounded-full bg-current" />
		</span>
	);
}

export { LoadingIndicator, loadingIndicatorVariants };
