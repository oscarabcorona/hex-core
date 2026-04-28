"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

interface TimePickerProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"type" | "value" | "onChange" | "size"
	> {
	/** Controlled time value as `"HH:MM"` or `"HH:MM:SS"` (24-hour). */
	value?: string;
	/** Fired with the new `"HH:MM"` (or `"HH:MM:SS"`) string when the user picks a time. */
	onChange?: (value: string) => void;
	/**
	 * Step in seconds — `60` shows HH:MM only (default), `1` shows HH:MM:SS.
	 * Smaller values change the spinner increment in supported browsers.
	 */
	step?: number;
	/** Earliest selectable time as `"HH:MM"`. */
	min?: string;
	/** Latest selectable time as `"HH:MM"`. */
	max?: string;
	/** Disable the input. */
	disabled?: boolean;
	/** Accessible label for the trigger (required when no adjacent visible <label>). */
	"aria-label"?: string;
}

/**
 * Time input — styled wrapper around the native `<input type="time">` so the
 * browser handles 12/24-hour locale, keyboard arrow stepping, and screen-reader
 * announcement. Value is a `"HH:MM"` (or `"HH:MM:SS"` when `step={1}`) string.
 *
 * For free-form composite hour/minute fields with explicit AM/PM segments,
 * compose Input + Select yourself — the native input covers ~95% of TimePicker
 * use cases with full a11y, including keyboard-driven hour/minute spinning.
 * @returns A token-styled native time input.
 */
const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
	(
		{
			value,
			onChange,
			step,
			min,
			max,
			disabled,
			className,
			"aria-label": ariaLabel,
			...rest
		},
		ref,
	) => {
		return (
			<input
				ref={ref}
				type="time"
				value={value ?? ""}
				step={step}
				min={min}
				max={max}
				disabled={disabled}
				aria-label={ariaLabel}
				onChange={(e) => onChange?.(e.target.value)}
				className={cn(
					"inline-flex h-[var(--control-height-md,2.5rem)] w-[160px] items-center rounded-md border border-input bg-background px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)] text-sm font-normal transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"disabled:pointer-events-none disabled:opacity-50",
					"[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
					className,
				)}
				{...rest}
			/>
		);
	},
);
TimePicker.displayName = "TimePicker";

export { TimePicker };
export type { TimePickerProps };
