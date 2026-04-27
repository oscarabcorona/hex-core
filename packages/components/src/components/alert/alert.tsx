import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const alertVariants = cva(
	[
		"relative w-full rounded-lg border px-[var(--space-4,1rem)] py-[var(--space-3,0.75rem)] text-sm",
		"transition-all duration-[var(--duration-normal,200ms)] ease-out",
		"[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-foreground",
		"[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px]",
	].join(" "),
	{
		variants: {
			variant: {
				default: "border-foreground/[0.08] bg-background text-foreground",
				destructive:
					"border-destructive/50 text-destructive [&>svg]:text-destructive bg-destructive/5",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

/** An inline notification banner for important messages. */
const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
	<div
		ref={ref}
		role="alert"
		className={cn(alertVariants({ variant }), className)}
		{...props}
	/>
));
Alert.displayName = "Alert";

/** The alert title heading. */
const AlertTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h5
		ref={ref}
		className={cn("mb-[var(--space-1,0.25rem)] font-medium leading-none tracking-tight", className)}
		{...props}
	/>
));
AlertTitle.displayName = "AlertTitle";

/** The alert description. Renders a div so paragraph children can be styled via [&_p]. */
const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
	),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
