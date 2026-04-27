import { format } from "date-fns";
import * as React from "react";
import { Calendar } from "../calendar/calendar.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover.js";
import { cn } from "../../lib/utils.js";

interface DatePickerProps {
	/** Controlled selected date. */
	value?: Date;
	/** Fired when the user picks a date in the calendar. */
	onChange?: (date: Date | undefined) => void;
	/** Placeholder shown when no date is selected. */
	placeholder?: string;
	/** date-fns format string for the trigger label. */
	dateFormat?: string;
	/** Disable the trigger. */
	disabled?: boolean;
	/** Extra class names on the trigger button. */
	className?: string;
	/** Accessible label for the trigger (required when no visible label is adjacent). */
	"aria-label"?: string;
	/**
	 * Caption layout forwarded to react-day-picker. Use `"dropdown"` (or
	 * `"dropdown-years"` / `"dropdown-months"`) to render native `<select>`
	 * navigation — useful for birth-date pickers and far-out years.
	 *
	 * Always pair `dropdown` layouts with explicit `startMonth` and `endMonth`;
	 * the RDP default span is ±100 years.
	 */
	captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
	/** Earliest month/year navigable in the calendar. Forwarded to react-day-picker. */
	startMonth?: Date;
	/** Latest month/year navigable in the calendar. Forwarded to react-day-picker. */
	endMonth?: Date;
}

/**
 * Date picker composed from Popover + Calendar + a styled trigger button.
 *
 * This is a minimal single-date picker. For multi/range, compose Calendar + Popover yourself.
 * @returns A button that opens a single-date calendar popover.
 */
function DatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	dateFormat = "PPP",
	disabled,
	className,
	"aria-label": ariaLabel,
	captionLayout,
	startMonth,
	endMonth,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					aria-label={ariaLabel ?? placeholder}
					className={cn(
						"inline-flex h-[var(--control-height-md,2.5rem)] w-[240px] items-center justify-start gap-[var(--gap-sm,0.5rem)] rounded-md border border-input bg-background px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)] text-left text-sm font-normal transition-all duration-[var(--duration-normal,200ms)] ease-out",
						"shadow-sm inset-ring-1 inset-ring-foreground/[0.06]",
						"hover:bg-accent hover:text-accent-foreground",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						"disabled:pointer-events-none disabled:opacity-50",
						!value && "text-muted-foreground",
						className,
					)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-4 w-4"
						aria-hidden="true"
					>
						<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
						<line x1="16" y1="2" x2="16" y2="6" />
						<line x1="8" y1="2" x2="8" y2="6" />
						<line x1="3" y1="10" x2="21" y2="10" />
					</svg>
					<span>{value ? format(value, dateFormat) : placeholder}</span>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				{/* Hardcoded mode='single' — for range/multi, compose Calendar + Popover directly. */}
				<Calendar
					mode="single"
					selected={value}
					onSelect={(date) => {
						onChange?.(date);
						setOpen(false);
					}}
					captionLayout={captionLayout}
					startMonth={startMonth}
					endMonth={endMonth}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
DatePicker.displayName = "DatePicker";

export { DatePicker };
export type { DatePickerProps };
