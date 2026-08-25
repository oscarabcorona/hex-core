"use client";

import { useId, useState } from "react";
import { MultiCombobox } from "@hex-core/components";

const tags = [
	{ value: "bug", label: "Bug" },
	{ value: "feature", label: "Feature" },
	{ value: "question", label: "Question" },
	{ value: "docs", label: "Documentation" },
	{ value: "good-first-issue", label: "Good first issue" },
	{ value: "wontfix", label: "Won't fix", disabled: true },
];

/**
 * MultiCombobox demo: three variants — default empty, pre-selected pair, and
 * a capped picker that disables further additions once the cap is reached.
 */
export function MultiComboboxDemo() {
	const [value, setValue] = useState<string[]>([]);
	const [preset, setPreset] = useState<string[]>(["bug", "feature"]);
	const [capped, setCapped] = useState<string[]>([]);

	const defaultLabelId = useId();
	const presetLabelId = useId();
	const cappedLabelId = useId();

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p
					id={defaultLabelId}
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					Tags
				</p>
				<MultiCombobox
					options={tags}
					value={value}
					onChange={setValue}
					placeholder="Pick tags"
					searchPlaceholder="Filter…"
					aria-labelledby={defaultLabelId}
				/>
			</div>
			<div>
				<p
					id={presetLabelId}
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					Pre-selected
				</p>
				<MultiCombobox
					options={tags}
					value={preset}
					onChange={setPreset}
					aria-labelledby={presetLabelId}
				/>
			</div>
			<div>
				<p
					id={cappedLabelId}
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					Up to 2
				</p>
				<MultiCombobox
					options={tags}
					value={capped}
					onChange={setCapped}
					maxSelected={2}
					aria-labelledby={cappedLabelId}
				/>
			</div>
		</div>
	);
}
