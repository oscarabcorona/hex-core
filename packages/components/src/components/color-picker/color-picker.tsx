"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";
import {
	formatHslTriplet,
	hexToHslTriplet,
	hslTripletToHex,
	parseHslTriplet,
} from "../../lib/color.js";
import { Input } from "../../primitives/input/input.js";
import { Label } from "../../primitives/label/label.js";
import { Slider } from "../../primitives/slider/slider.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover.js";

/** Tolerance for treating a float as integer-valued (handles arithmetic drift in HSL roundtrips). */
const INTEGER_EPSILON = 1e-6;

const looksInteger = (n: number) => Math.abs(n - Math.round(n)) < INTEGER_EPSILON;

/** Props for the ColorPicker component. */
export interface ColorPickerProps {
	/**
	 * Current color as an HSL triplet string (`"<H> <S>% <L>%"`, e.g. `"240 5.9% 10%"`).
	 * Match the format used by `@hex-core/tokens`; round-trip safe.
	 */
	value: string;
	/**
	 * Called with the next HSL triplet whenever the user drags a slider or commits a valid hex value.
	 * Not called for invalid hex input — the picker keeps the prior value until the input parses cleanly.
	 */
	onChange: (value: string) => void;
	/**
	 * Disable interaction. Native `disabled` attribute is set on the trigger so the
	 * popover doesn't open via mouse or keyboard activation. Tab focus still lands
	 * on the trigger per browser defaults; if you want to fully remove it from the
	 * tab order, wrap in a parent that handles `tabIndex` accordingly.
	 */
	disabled?: boolean;
	/** Accessible name for the trigger button (defaults to "Pick color"). */
	"aria-label"?: string;
	/** Additional class names merged onto the trigger. */
	className?: string;
}

/**
 * HSL-native color picker. Edits an HSL triplet directly via three sliders
 * (H/S/L), with a hex input as a display adapter.
 *
 * Round-trip safe: triplet → hex → triplet preserves the slider state because
 * sliders are the source of truth and hex updates them only when valid.
 *
 * @param props - Controlled component; `value` and `onChange` are required.
 * @returns A trigger button that opens a popover with H/S/L sliders + hex input.
 * @example
 * ```tsx
 * const [color, setColor] = React.useState("240 5.9% 10%");
 * <ColorPicker value={color} onChange={setColor} aria-label="Primary color" />
 * ```
 */
function ColorPicker({
	value,
	onChange,
	disabled,
	"aria-label": ariaLabel = "Pick color",
	className,
}: ColorPickerProps) {
	// Memoize so the slider-row callbacks below are stable across renders with
	// the same `value`; downstream `Slider`s avoid spurious re-mounts.
	const hsl = React.useMemo(() => parseHslTriplet(value), [value]);
	const hex = React.useMemo(() => hslTripletToHex(value), [value]);

	const update = React.useCallback(
		(patch: Partial<typeof hsl>) => {
			onChange(formatHslTriplet({ ...hsl, ...patch }));
		},
		[hsl, onChange],
	);

	// Hex input is locally controlled so the user can type intermediate states
	// (e.g. "#1a") without committing. Sync the buffer to the canonical hex
	// whenever the input is NOT focused — typing into a focused input must not
	// be clobbered by a parent re-render reflecting our own `onChange`.
	const hexInputRef = React.useRef<HTMLInputElement>(null);
	const [hexBuffer, setHexBuffer] = React.useState(hex);
	React.useEffect(() => {
		if (
			typeof document === "undefined" ||
			document.activeElement !== hexInputRef.current
		) {
			setHexBuffer(hex);
		}
	}, [hex]);

	const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value;
		setHexBuffer(next);
		const triplet = hexToHslTriplet(next);
		if (triplet !== null) onChange(triplet);
	};

	const hexId = React.useId();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					aria-label={ariaLabel}
					className={cn(
						"inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-sm",
						"transition-all duration-[var(--duration-normal,200ms)] ease-out",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						"hover:shadow-md disabled:pointer-events-none disabled:opacity-50",
						className,
					)}
				>
					<span
						aria-hidden="true"
						className="h-5 w-5 rounded-sm border border-border"
						style={{ backgroundColor: `hsl(${value})` }}
					/>
					<span className="font-mono text-xs uppercase">{hex}</span>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-72 p-4" align="start">
				<div className="space-y-4">
					<SliderRow
						label="Hue"
						suffix="°"
						value={hsl.h}
						max={360}
						step={1}
						onChange={(h) => update({ h })}
					/>
					<SliderRow
						label="Saturation"
						suffix="%"
						value={hsl.s}
						max={100}
						step={0.1}
						onChange={(s) => update({ s })}
					/>
					<SliderRow
						label="Lightness"
						suffix="%"
						value={hsl.l}
						max={100}
						step={0.1}
						onChange={(l) => update({ l })}
					/>
					<div className="flex items-end gap-2">
						<div className="flex-1 space-y-1">
							<Label htmlFor={hexId} className="text-xs">
								Hex
							</Label>
							<Input
								id={hexId}
								ref={hexInputRef}
								value={hexBuffer}
								onChange={handleHexChange}
								className="font-mono text-xs uppercase"
								spellCheck={false}
								autoComplete="off"
							/>
						</div>
						<span
							aria-hidden="true"
							className="h-9 w-9 shrink-0 rounded-md border border-border"
							style={{ backgroundColor: `hsl(${value})` }}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

interface SliderRowProps {
	label: string;
	suffix: string;
	value: number;
	max: number;
	step: number;
	onChange: (next: number) => void;
}

/**
 * One labeled slider row inside the ColorPicker popover. Internal helper —
 * not exported.
 * @param props - Slider config + value-change callback.
 */
function SliderRow({ label, suffix, value, max, step, onChange }: SliderRowProps) {
	const display = looksInteger(value) ? `${Math.round(value)}` : value.toFixed(1);
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<Label className="text-xs">{label}</Label>
				<span className="font-mono text-xs tabular-nums text-muted-foreground">
					{display}
					{suffix}
				</span>
			</div>
			<Slider
				value={[value]}
				min={0}
				max={max}
				step={step}
				aria-label={label}
				onValueChange={(values) => onChange(values[0] ?? 0)}
			/>
		</div>
	);
}

export { ColorPicker };
