import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const timePickerSchema: ComponentSchemaDefinition = {
	name: "time-picker",
	displayName: "Time Picker",
	description:
		"Time input — styled wrapper around the native <input type='time'>. Value is a 'HH:MM' (or 'HH:MM:SS' with step=1) string. The browser provides 12/24-hour locale handling, keyboard arrow spinning, and screen-reader announcement.",
	category: "component",
	subcategory: "input",
	props: [
		{
			name: "value",
			type: "string",
			required: false,
			description: "Controlled time value as 'HH:MM' or 'HH:MM:SS' (24-hour).",
		},
		{
			name: "onChange",
			type: "function",
			required: false,
			description:
				"Callback when the user picks a time: (value: string) => void. Value is always 24-hour 'HH:MM' (or 'HH:MM:SS' when step=1).",
		},
		{
			name: "step",
			type: "number",
			required: false,
			description:
				"Step in seconds. Use 60 (default) for HH:MM, 1 for HH:MM:SS, 300 for 5-minute steps, 900 for 15-minute. Note: Chrome/Edge picker dropdown UI does NOT visually snap minutes to the step — it only affects keyboard arrow stepping and form validation. Off-step values are still rejected.",
		},
		{
			name: "min",
			type: "string",
			required: false,
			description: "Earliest selectable time as 'HH:MM'.",
		},
		{
			name: "max",
			type: "string",
			required: false,
			description: "Latest selectable time as 'HH:MM'.",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the input.",
		},
		{
			name: "aria-label",
			type: "string",
			required: false,
			description: "Accessible label — required when no adjacent visible <label> is used.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "input", "ring"],
	examples: [
		{
			title: "Basic time picker",
			description: "Bind a string state and render the picker",
			code: 'import { useState } from "react";\nimport { TimePicker } from "@/components/ui/time-picker";\n\nexport function Example() {\n  const [time, setTime] = useState<string>();\n  return <TimePicker value={time} onChange={setTime} aria-label="Meeting time" />;\n}',
		},
		{
			title: "With seconds + 5-minute step",
			description:
				"step={1} adds a seconds segment; step={300} steps minutes by 5 in browsers that support it",
			code: 'import { useState } from "react";\nimport { TimePicker } from "@/components/ui/time-picker";\n\nexport function Example() {\n  const [time, setTime] = useState<string>("09:00");\n  return <TimePicker value={time} onChange={setTime} step={300} min="09:00" max="17:00" aria-label="Working hours start" />;\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for selecting a time of day in a form (meeting time, reminder, business hours start/end). Browser handles 12/24-hour locale automatically based on user system settings; the wire format is always 24-hour 'HH:MM'. Component is controlled-only — pair `value` with `onChange`; for uncontrolled use, the input behaves as a controlled empty input with no upstream state.",
		whenNotToUse:
			"Don't use for durations (hours/minutes elapsed) — use composite Input fields. Don't use for date+time together — combine with DatePicker. Don't use when explicit AM/PM segments matter for layout — compose Input + Select yourself; the native input renders AM/PM only in 12-hour locales. Don't use when you need pixel-identical chrome across browsers — the dropdown indicator is webkit-styled (Chrome/Edge/Safari) and absent in Firefox.",
		commonMistakes: [
			"Passing a Date object to value — must be a string in 'HH:MM' format",
			"Treating onChange as 12-hour — the value is always 24-hour, the browser only displays it in user locale",
			"Missing aria-label when there's no adjacent visible <label> — input gets no accessible name",
			"Setting step to a value that doesn't divide evenly into 3600 (e.g. step=7) — confusing UX in browsers that snap to it",
			"Expecting Chrome/Edge's picker dropdown to visually skip minutes per step — it doesn't. The minute scroll wheel always shows every minute; step only constrains keyboard arrow stepping and form validation",
			"Setting min/max with seconds when step!=1 — the seconds segment is hidden, so users can't actually reach values that need it",
			"Expecting the dropdown picker indicator to render in Firefox — only webkit browsers paint it; Firefox renders the input without that affordance",
			"Expecting an uncontrolled mode — TimePicker is controlled-only. Pass both value + onChange, or omit both and accept that user input has no place to live",
		],
		relatedComponents: ["date-picker", "input", "select"],
		accessibilityNotes:
			"Native <input type='time'> — assistive tech announces hour/minute (and seconds if shown) segments individually. Arrow keys spin each segment. Disabled state is announced. Pass aria-label or wrap with a <label htmlFor>. Visual chrome (icon, dropdown affordance) is browser-controlled and varies across Chrome/Edge/Safari (rendered) and Firefox (absent).",
		tokenBudget: 700,
	},
	tags: ["time-picker", "time", "input", "form"],
};
