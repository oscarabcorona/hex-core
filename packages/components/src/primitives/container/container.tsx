import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * CVA variants for Container — max-width wrapper bound to `--container-*` tokens.
 * Variant names match token names (`sm`/`md`/`lg`/`xl`/`full`); `full` removes the clamp.
 * Padding maps to `--space-*` tokens.
 */
const containerVariants = cva("mx-auto w-full", {
	variants: {
		size: {
			sm: "max-w-[var(--container-sm,33rem)]",
			md: "max-w-[var(--container-md,40rem)]",
			lg: "max-w-[var(--container-lg,50rem)]",
			xl: "max-w-[var(--container-xl,66rem)]",
			full: "max-w-full",
		},
		padding: {
			none: "",
			sm: "px-[var(--space-3,0.75rem)]",
			md: "px-[var(--space-4,1rem)]",
			lg: "px-[var(--space-8,2rem)]",
		},
	},
	defaultVariants: {
		size: "lg",
		padding: "md",
	},
});

/** Props for the Container component. */
export interface ContainerProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof containerVariants> {
	/**
	 * Render as a different element via Radix `Slot`. Pass `<Container asChild><main>...</main></Container>`
	 * to render the layout as a `<main>` (or `<section>`, `<article>`, etc.) and inherit landmark semantics.
	 */
	asChild?: boolean;
}

/**
 * A centered max-width wrapper for page content. Use to constrain reading-width sections.
 * Pass `asChild` to render as a semantic landmark (`<main>`, `<section>`, etc.) instead of a plain `<div>`.
 *
 * @param props - Container props including `size`, `padding`, and optional `asChild`.
 * @returns A wrapper element with `mx-auto`, max-width clamp, and optional horizontal padding.
 * @example
 * ```tsx
 * <Container size="lg" padding="md" asChild>
 *   <main>
 *     <h1>Article title</h1>
 *     <p>Reading-width content...</p>
 *   </main>
 * </Container>
 * ```
 */
function Container({ className, size, padding, asChild = false, ...props }: ContainerProps) {
	const Comp = asChild ? Slot : "div";
	return <Comp className={cn(containerVariants({ size, padding }), className)} {...props} />;
}

export { Container, containerVariants };
