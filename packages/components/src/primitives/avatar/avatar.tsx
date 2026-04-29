"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Root container for an avatar (image + fallback). */
const Avatar = React.forwardRef<
	React.ComponentRef<typeof AvatarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={cn("relative flex h-[var(--control-height-md,2.5rem)] w-[var(--control-height-md,2.5rem)] shrink-0 overflow-hidden rounded-full", className)}
		{...props}
	/>
));
Avatar.displayName = "Avatar";

/** Avatar image. AvatarFallback renders in its place when the image is missing or errors. */
const AvatarImage = React.forwardRef<
	React.ComponentRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn("aspect-square h-full w-full object-cover", className)}
		{...props}
	/>
));
AvatarImage.displayName = "AvatarImage";

/** Fallback content (usually initials or an icon) shown when the image is missing or fails. Supports delayMs to avoid flashing for fast-loading images. */
const AvatarFallback = React.forwardRef<
	React.ComponentRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			"flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground",
			className,
		)}
		{...props}
	/>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
