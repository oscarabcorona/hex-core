import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "../../lib/utils.js";

// Local ambient — components run in browsers where bundlers (Next, Vite, tsup)
// replace `process.env.NODE_ENV` at build time. Avoids pulling @types/node into
// the components package just for one dev-mode warning.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

interface SliderProps
	extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
	/**
	 * Per-thumb accessible labels. When the slider has multiple thumbs, pass
	 * one entry per thumb (e.g. ["Minimum", "Maximum"]). For a single-thumb
	 * slider, the Root's `aria-label` / `aria-labelledby` is mirrored onto
	 * the thumb automatically — pass `thumbLabels` only when those defaults
	 * are insufficient.
	 */
	thumbLabels?: string[];
}

/**
 * A range input with one or more draggable thumbs.
 * Built on Radix UI Slider with keyboard controls (arrows, Home, End, PageUp/Down).
 */
const Slider = React.forwardRef<
	React.ComponentRef<typeof SliderPrimitive.Root>,
	SliderProps
>(({ className, thumbLabels, ...props }, ref) => {
	const values = props.value ?? props.defaultValue ?? [0];
	const rootLabel = props["aria-label"];
	const rootLabelledBy = props["aria-labelledby"];

	if (
		typeof process !== "undefined" &&
		process.env?.NODE_ENV !== "production" &&
		thumbLabels &&
		thumbLabels.length !== values.length
	) {
		console.warn(
			`Slider: thumbLabels.length (${thumbLabels.length}) does not match value.length (${values.length}). ` +
				`Missing labels fall back to indexed names; extra labels are ignored.`,
		);
	}

	return (
		<SliderPrimitive.Root
			ref={ref}
			className={cn("relative flex w-full touch-none select-none items-center", className)}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
				<SliderPrimitive.Range className="absolute h-full bg-primary" />
			</SliderPrimitive.Track>
			{values.map((_, i) => {
				const explicit = thumbLabels?.[i];
				const fallback =
					values.length === 1
						? rootLabel
						: rootLabel
							? `${rootLabel} (${i + 1} of ${values.length})`
							: undefined;
				return (
					<SliderPrimitive.Thumb
						// biome-ignore lint/suspicious/noArrayIndexKey: Radix renders one thumb per value by index
						key={i}
						aria-label={explicit ?? fallback}
						aria-labelledby={
							explicit || fallback ? undefined : rootLabelledBy
						}
						className={cn(
							"block h-5 w-5 rounded-full border-2 border-primary bg-background",
							"transition-all duration-[var(--duration-normal,200ms)] ease-out shadow-md",
							"hover:shadow-lg hover:scale-110",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							"disabled:pointer-events-none disabled:opacity-50",
						)}
					/>
				);
			})}
		</SliderPrimitive.Root>
	);
});
Slider.displayName = "Slider";

export type { SliderProps };

export { Slider };
