import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Root container for a radio group. Pair with one or more RadioGroupItem. */
const RadioGroup = React.forwardRef<
	React.ComponentRef<typeof RadioGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
	<RadioGroupPrimitive.Root
		className={cn(
			"grid gap-[var(--gap-sm,0.5rem)] data-[orientation=horizontal]:flex data-[orientation=horizontal]:flex-row",
			className,
		)}
		ref={ref}
		{...props}
	/>
));
RadioGroup.displayName = "RadioGroup";

/** A single radio option within a RadioGroup. */
const RadioGroupItem = React.forwardRef<
	React.ComponentRef<typeof RadioGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
	<RadioGroupPrimitive.Item
		ref={ref}
		className={cn(
			"aspect-square h-4 w-4 rounded-full border border-input",
			"transition-all duration-[var(--duration-normal,200ms)] ease-out shadow-sm inset-ring-1 inset-ring-foreground/[0.06]",
			"hover:border-ring/50 hover:shadow-md",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"data-[state=checked]:border-primary",
			className,
		)}
		{...props}
	>
		<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
			<svg viewBox="0 0 24 24" fill="currentColor" className="h-2 w-2 text-primary" aria-hidden="true">
				<circle cx="12" cy="12" r="10" />
			</svg>
		</RadioGroupPrimitive.Indicator>
	</RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
