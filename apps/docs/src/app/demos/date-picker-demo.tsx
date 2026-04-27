"use client";

import { useState } from "react";
import { DatePicker } from "../../components/ui";

/**
 * DatePicker demo: four variants — uncontrolled-empty, pre-selected value, a
 * disabled trigger, and a birth-date picker with the native year dropdown.
 */
export function DatePickerDemo() {
	const [date, setDate] = useState<Date | undefined>();
	const [preset, setPreset] = useState<Date | undefined>(new Date());
	const [dob, setDob] = useState<Date | undefined>();

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Empty</p>
				<DatePicker value={date} onChange={setDate} />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Pre-selected
				</p>
				<DatePicker value={preset} onChange={setPreset} />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
				<DatePicker disabled />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					With year dropdown (birth-date)
				</p>
				<DatePicker
					value={dob}
					onChange={setDob}
					placeholder="Date of birth"
					captionLayout="dropdown"
					startMonth={new Date(1925, 0)}
					endMonth={new Date(new Date().getFullYear(), 11)}
					aria-label="Date of birth"
				/>
			</div>
		</div>
	);
}
