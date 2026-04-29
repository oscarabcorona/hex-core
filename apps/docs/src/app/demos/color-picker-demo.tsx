"use client";

import { useState } from "react";
import { ColorPicker } from "../../components/ui";

// Seeds match the live `defaultTheme.tokens.light` values so the demo
// shows the actual palette consumers see in the catalog. If the default
// theme changes, refresh these to match (or, future work, source them
// from `@hex-core/tokens`'s `defaultTheme` directly).
const TOKENS: ReadonlyArray<{ id: string; label: string; initial: string }> = [
	{ id: "primary", label: "Primary", initial: "222 25% 18%" },
	{ id: "accent", label: "Accent", initial: "262 83% 58%" },
	{ id: "destructive", label: "Destructive", initial: "0 65% 50%" },
];

/**
 * ColorPicker demo: three theme-token rows showing live HSL editing. The
 * triplet round-trips through `@hex-core/tokens`' format, so the same value
 * can be dropped straight into a `--color-*` CSS variable.
 */
export function ColorPickerDemo() {
	const [values, setValues] = useState<Record<string, string>>(() =>
		Object.fromEntries(TOKENS.map((t) => [t.id, t.initial])),
	);

	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			{TOKENS.map((t) => (
				<div key={t.id} className="flex items-center justify-between gap-3">
					<div className="flex flex-col">
						<span className="text-sm font-medium text-foreground">{t.label}</span>
						<span className="font-mono text-[11px] text-muted-foreground">
							{values[t.id]}
						</span>
					</div>
					<ColorPicker
						value={values[t.id] ?? t.initial}
						onChange={(next) => setValues((prev) => ({ ...prev, [t.id]: next }))}
						aria-label={`${t.label} color`}
					/>
				</div>
			))}
		</div>
	);
}
