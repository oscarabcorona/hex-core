"use client";

import { useState } from "react";
import { ColorPicker } from "../../components/ui";

const TOKENS: ReadonlyArray<{ id: string; label: string; initial: string }> = [
	{ id: "primary", label: "Primary", initial: "240 5.9% 10%" },
	{ id: "accent", label: "Accent", initial: "262 83% 58%" },
	{ id: "destructive", label: "Destructive", initial: "0 72% 45%" },
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
