import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const tagVariants = cva(
	[
		"inline-flex items-center gap-[var(--gap-xs,0.25rem)] rounded-full border px-2.5 py-0.5 text-xs font-medium",
		"transition-all duration-[var(--duration-normal,200ms)] ease-out",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
	].join(" "),
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground",
				secondary:
					"border-foreground/15 bg-secondary text-secondary-foreground hover:border-foreground/20",
				destructive: "border-transparent bg-destructive text-destructive-foreground",
				outline: "border-foreground/20 text-foreground hover:border-foreground/30",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export interface TagProps
	extends Omit<React.HTMLAttributes<HTMLSpanElement>, "onRemove">,
		VariantProps<typeof tagVariants> {
	/** Forwarded ref onto the root span element. */
	ref?: React.Ref<HTMLSpanElement>;
	/** Optional leading icon (`<svg>` or component). Sized 12×12. */
	icon?: React.ReactNode;
	/**
	 * Click handler for the close button. When provided, an inline ✕ button
	 * is rendered after the children with an `aria-label` derived from the
	 * children's string content (or a generic "Remove" if no string can be
	 * extracted). Pass undefined for a non-interactive Tag — at that point,
	 * prefer Badge directly.
	 */
	onRemove?: () => void;
	/** Override the auto-derived `aria-label` on the close button. */
	removeLabel?: string;
}

/**
 * Walk a `React.ReactNode` tree depth-first and collect all string +
 * number leaves into a single space-separated label. Used to derive
 * the close button's `aria-label` even when children are JSX
 * (`<strong>Bold</strong>` → `"Bold"`).
 *
 * @param children - React children passed to `<Tag>`.
 * @returns Concatenated string content, or null if no string leaves found.
 */
function extractStringLabel(children: React.ReactNode): string | null {
	const parts: string[] = [];
	const visit = (node: React.ReactNode): void => {
		if (node === null || node === undefined || typeof node === "boolean") return;
		if (typeof node === "string") {
			parts.push(node);
			return;
		}
		if (typeof node === "number") {
			parts.push(String(node));
			return;
		}
		if (Array.isArray(node)) {
			for (const item of node) visit(item);
			return;
		}
		if (React.isValidElement(node)) {
			const props = node.props as { children?: React.ReactNode };
			visit(props.children);
		}
	};
	visit(children);
	const joined = parts.join(" ").replace(/\s+/g, " ").trim();
	return joined.length > 0 ? joined : null;
}

/**
 * An interactive tag / chip primitive — Badge with an optional dismiss
 * affordance. Mirrors {@link Badge}'s CVA variants so the visual sibling
 * is obvious; adds a built-in close button when `onRemove` is provided.
 *
 * For non-interactive labels (status indicators, counts) use {@link Badge}
 * directly. For "click to filter" state-bearing chips, use Toggle or
 * ToggleGroup — Tag is for "this token represents a value the user can
 * dismiss" (filters, multi-select selections, draft attachments).
 *
 * @example
 * ```tsx
 * <Tag variant="secondary" onRemove={() => removeFilter("urgent")}>
 *   Urgent
 * </Tag>
 * ```
 *
 * @returns A span containing the label + optional icon + optional close button.
 */
function Tag({
	className,
	variant,
	icon,
	onRemove,
	removeLabel,
	children,
	ref,
	...props
}: TagProps) {
	const labelText = extractStringLabel(children);
	const ariaLabel = removeLabel ?? (labelText ? `Remove ${labelText}` : "Remove");

	return (
		<span ref={ref} className={cn(tagVariants({ variant }), className)} {...props}>
			{icon ? (
				<span aria-hidden="true" className="-ml-0.5 [&_svg]:size-3 [&_svg]:shrink-0">
					{icon}
				</span>
			) : null}
			<span>{children}</span>
			{onRemove ? (
				<button
					type="button"
					onClick={onRemove}
					aria-label={ariaLabel}
					className={cn(
						"-mr-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
						"transition-all duration-[var(--duration-normal,200ms)] ease-out",
						"hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						"active:scale-[0.98]",
					)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="size-3"
						aria-hidden="true"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			) : null}
		</span>
	);
}

export { Tag, tagVariants };
