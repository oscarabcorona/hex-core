"use client";

import { useState } from "react";
import { TimePicker } from "@hex-core/components";

/**
 * TimePicker demo: three variants — default, with seconds (step=1), and a
 * working-hours window (5-minute step, min/max bounded).
 */
export function TimePickerDemo() {
	const [time, setTime] = useState<string>();
	const [precise, setPrecise] = useState<string | undefined>("09:30:15");
	const [window, setWindow] = useState<string | undefined>("09:00");

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Default (HH:MM)
				</p>
				<TimePicker value={time} onChange={setTime} aria-label="Meeting time" />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					With seconds (step=1)
				</p>
				<TimePicker
					value={precise}
					onChange={setPrecise}
					step={1}
					aria-label="Precise time"
				/>
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Working hours (09:00–17:00, 15-minute step)
				</p>
				<TimePicker
					value={window}
					onChange={setWindow}
					step={900}
					min="09:00"
					max="17:00"
					aria-label="Working hours start"
				/>
				<p className="mt-2 text-xs text-muted-foreground">
					<code>step</code> snaps keyboard arrows + validation to the
					interval. The picker dropdown UI is browser-controlled —
					Chrome/Edge show every minute; the value is still rejected if
					off-step.
				</p>
			</div>
		</div>
	);
}
