"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/**
 * The global toast container. Render once in your app root.
 * Re-export of Sonner's Toaster styled to use Hex Core theme tokens.
 * @param props - Sonner Toaster props (position, richColors, etc.)
 * @returns A styled portal container for toast notifications
 */
function Toaster({ ...props }: ToasterProps) {
	return (
		<SonnerToaster
			theme="system"
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
				},
			}}
			{...props}
		/>
	);
}

export { Toaster, toast };
