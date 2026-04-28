"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils.js";

const labelVariants = cva(
	"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

export interface LabelProps
	extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
		VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<React.ComponentRef<typeof LabelPrimitive.Root>, LabelProps>(
	({ className, ...props }, ref) => (
		<LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
	),
);
Label.displayName = "Label";

export { Label };
