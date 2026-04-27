import * as React from "react";
import { cn } from "../../lib/utils.js";

// Card consumes tokens --space-6, --space-4, --duration-normal.
// Fallbacks match Tailwind defaults for consumers without a theme loaded.

/** A container card with subtle shadow and border. */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"rounded-lg border border-foreground/[0.08] bg-card text-card-foreground",
				"shadow-sm transition-all duration-[var(--duration-normal,200ms)] ease-out",
				"hover:shadow-md",
				className,
			)}
			{...props}
		/>
	),
);
Card.displayName = "Card";

/** The header section of a Card. */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex flex-col space-y-1.5 p-[var(--space-6,1.5rem)]", className)}
			{...props}
		/>
	),
);
CardHeader.displayName = "CardHeader";

/** The title element inside a CardHeader. */
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h3
			ref={ref}
			className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
			{...props}
		/>
	),
);
CardTitle.displayName = "CardTitle";

/** A description element inside a CardHeader. */
const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

/** The main content area of a Card. */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("p-[var(--space-6,1.5rem)] pt-0", className)} {...props} />
	),
);
CardContent.displayName = "CardContent";

/** The footer section of a Card. */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex items-center p-[var(--space-6,1.5rem)] pt-0", className)}
			{...props}
		/>
	),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
