"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";
import { toggleVariants } from "../toggle/toggle.js";

type ToggleGroupContextValue = VariantProps<typeof toggleVariants>;

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
	size: "default",
	variant: "default",
});

/** Root container for a set of toggles (single-select or multi-select). */
const ToggleGroup = React.forwardRef<
	React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
		VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
	<ToggleGroupPrimitive.Root
		ref={ref}
		className={cn("flex items-center justify-center gap-1", className)}
		{...props}
	>
		<ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
	</ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = "ToggleGroup";

/** A single toggle option within a ToggleGroup. Inherits variant/size from context. */
const ToggleGroupItem = React.forwardRef<
	React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
		VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
	const context = React.useContext(ToggleGroupContext);
	return (
		<ToggleGroupPrimitive.Item
			ref={ref}
			className={cn(
				toggleVariants({
					variant: variant ?? context.variant,
					size: size ?? context.size,
				}),
				className,
			)}
			{...props}
		>
			{children}
		</ToggleGroupPrimitive.Item>
	);
});
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
