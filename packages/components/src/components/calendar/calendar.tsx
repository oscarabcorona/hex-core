import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../../lib/utils.js";

/**
 * Calendar date grid built on react-day-picker v9. Forwards all DayPicker props.
 *
 * Pass `mode="single" | "multiple" | "range"` and bind `selected` / `onSelect`
 * to control date selection. Style tokens follow the project palette; individual
 * parts can be overridden via the `classNames` prop.
 * @returns A themed react-day-picker DayPicker instance.
 */
function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("relative p-[var(--space-3,0.75rem)]", className)}
			classNames={{
				months: "flex flex-col sm:flex-row gap-[var(--gap-md,1rem)]",
				month: "flex flex-col gap-[var(--gap-md,1rem)]",
				month_caption: "flex h-7 items-center justify-center",
				caption_label: "text-sm font-medium",
				nav: "absolute inset-x-3 top-3 z-10 flex items-center justify-between pointer-events-none [&>button]:pointer-events-auto",
				button_previous: cn(
					"inline-flex h-7 w-7 items-center justify-center rounded-md border border-foreground/[0.08] bg-transparent p-0 opacity-60 transition-all duration-[var(--duration-normal,200ms)] ease-out hover:opacity-100 disabled:pointer-events-none disabled:opacity-30",
				),
				button_next: cn(
					"inline-flex h-7 w-7 items-center justify-center rounded-md border border-foreground/[0.08] bg-transparent p-0 opacity-60 transition-all duration-[var(--duration-normal,200ms)] ease-out hover:opacity-100 disabled:pointer-events-none disabled:opacity-30",
				),
				month_grid: "w-full border-collapse space-y-1",
				weekdays: "flex",
				weekday: "text-muted-foreground rounded-md w-[var(--control-height-sm,2.25rem)] font-normal text-[0.8rem]",
				week: "flex w-full mt-[var(--space-2,0.5rem)]",
				day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].range-end)]:rounded-r-md [&:has([aria-selected].range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
				day_button:
					"inline-flex h-[var(--control-height-sm,2.25rem)] w-[var(--control-height-sm,2.25rem)] items-center justify-center rounded-md p-0 text-sm font-normal transition-all duration-[var(--duration-normal,200ms)] ease-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-selected:opacity-100",
				selected:
					"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
				today: "bg-accent text-accent-foreground",
				outside:
					"day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
				disabled: "text-muted-foreground opacity-50",
				range_start: "day-range-start range-start",
				range_end: "day-range-end range-end",
				range_middle:
					"aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron: ({ orientation, className: chevronClassName }) => {
					const rotation =
						orientation === "left"
							? "rotate-90"
							: orientation === "right"
								? "-rotate-90"
								: orientation === "up"
									? "rotate-180"
									: "";
					return (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className={cn("h-4 w-4", rotation, chevronClassName)}
							aria-hidden="true"
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					);
				},
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
