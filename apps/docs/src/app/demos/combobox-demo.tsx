"use client";

import { useId, useState } from "react";
import { Combobox } from "../../components/ui";

const frameworks = [
	{ value: "next", label: "Next.js" },
	{ value: "remix", label: "Remix" },
	{ value: "astro", label: "Astro" },
	{ value: "nuxt", label: "Nuxt" },
	{ value: "sveltekit", label: "SvelteKit" },
	{ value: "solidstart", label: "SolidStart", disabled: true },
];

/**
 * Combobox demo: three variants — default (empty), pre-selected value, and
 * disabled trigger. Includes a disabled option ("SolidStart") to show row
 * affordance.
 */
export function ComboboxDemo() {
	const [value, setValue] = useState<string>();
	const [preset, setPreset] = useState<string | undefined>("next");

	const defaultLabelId = useId();
	const preselectedLabelId = useId();
	const disabledLabelId = useId();

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p
					id={defaultLabelId}
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					Default
				</p>
				<Combobox
					options={frameworks}
					value={value}
					onChange={setValue}
					placeholder="Select a framework"
					searchPlaceholder="Search framework…"
					aria-labelledby={defaultLabelId}
				/>
			</div>
			<div>
				<p
					id={preselectedLabelId}
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					Pre-selected
				</p>
				<Combobox
					options={frameworks}
					value={preset}
					onChange={setPreset}
					placeholder="Select a framework"
					searchPlaceholder="Search framework…"
					aria-labelledby={preselectedLabelId}
				/>
			</div>
			<div>
				<p
					id={disabledLabelId}
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					Disabled
				</p>
				<Combobox
					options={frameworks}
					disabled
					placeholder="Select a framework"
					searchPlaceholder="Search framework…"
					aria-labelledby={disabledLabelId}
				/>
			</div>
		</div>
	);
}
