import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const datePickerSchema: ComponentSchemaDefinition = {
	name: "date-picker",
	displayName: "Date Picker",
	description:
		"Date input composed from Popover + Calendar. Shows the selected date formatted via date-fns, opens a calendar grid on click.",
	category: "component",
	subcategory: "input",
	props: [
		{
			name: "value",
			type: "object",
			required: false,
			description: "Controlled selected Date",
		},
		{
			name: "onChange",
			type: "function",
			required: false,
			description: "Callback when the user selects a date: (date: Date | undefined) => void",
		},
		{
			name: "placeholder",
			type: "string",
			required: false,
			default: "Pick a date",
			description: "Text shown on the trigger when no date is selected",
		},
		{
			name: "dateFormat",
			type: "string",
			required: false,
			default: "PPP",
			description: "date-fns format token for the trigger label (e.g. 'PPP', 'yyyy-MM-dd')",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the picker trigger",
		},
		{
			name: "aria-label",
			type: "string",
			required: false,
			description: "Accessible label — required when no adjacent visible <label> is used",
		},
		{
			name: "captionLayout",
			type: "string",
			required: false,
			description:
				"Caption layout forwarded to react-day-picker. Use 'dropdown' (or 'dropdown-years' / 'dropdown-months') for native <select> navigation — common for birth-date pickers. Default is 'label' (chevron buttons only).",
		},
		{
			name: "startMonth",
			type: "object",
			required: false,
			description:
				"Earliest month/year navigable in the calendar (Date). Forwarded to react-day-picker. Pair with captionLayout='dropdown'.",
		},
		{
			name: "endMonth",
			type: "object",
			required: false,
			description:
				"Latest month/year navigable in the calendar (Date). Forwarded to react-day-picker. Pair with captionLayout='dropdown'.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["react-day-picker", "date-fns", "@radix-ui/react-popover", "clsx", "tailwind-merge"],
		internal: ["components/calendar/calendar", "components/popover/popover", "lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "border", "input", "ring", "accent", "accent-foreground", "muted-foreground"],
	examples: [
		{
			title: "Basic date picker",
			description: "Bind a Date state and render the picker",
			code: 'import { useState } from "react";\nimport { DatePicker } from "@/components/ui/date-picker";\n\nexport function Example() {\n  const [date, setDate] = useState<Date | undefined>();\n  return <DatePicker value={date} onChange={setDate} />;\n}',
		},
		{
			title: "Birth-date picker with year dropdown",
			description:
				"Use captionLayout='dropdown' with explicit startMonth/endMonth to get native <select> year navigation",
			code: 'import { useState } from "react";\nimport { DatePicker } from "@/components/ui/date-picker";\n\nexport function Example() {\n  const [dob, setDob] = useState<Date | undefined>();\n  return (\n    <DatePicker\n      value={dob}\n      onChange={setDob}\n      placeholder="Date of birth"\n      captionLayout="dropdown"\n      startMonth={new Date(1925, 0)}\n      endMonth={new Date(new Date().getFullYear(), 11)}\n    />\n  );\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for selecting a single date in a form. Shows a formatted text label and opens a month grid on click. Composes Popover + Calendar + button trigger. For far-away years (birthdays, historical dates), pass captionLayout='dropdown' plus startMonth/endMonth.",
		whenNotToUse:
			"Don't use for date ranges (compose Calendar mode='range' + Popover yourself). Don't use for native mobile date UX (<input type='date'> is often better on phones). Don't use if you need time selection — combine with a separate time picker.",
		commonMistakes: [
			"Passing a string to value — must be a Date object",
			"Missing aria-label when the picker has no adjacent visible <label>",
			"Overriding className in a way that hurts focus ring visibility",
			"Forgetting that the popover auto-closes on select — provide onChange to capture the value",
			"Setting captionLayout='dropdown' without startMonth/endMonth — react-day-picker defaults to ±100 years, producing a 200-option dropdown",
		],
		relatedComponents: ["calendar", "popover", "input"],
		accessibilityNotes:
			"Trigger is a real <button> with focus ring. When rendered without a visible label, pass aria-label. The popover portals and traps keyboard focus inside Calendar until the user selects or presses Escape.",
		tokenBudget: 1115,
	},
	tags: ["date-picker", "date", "input", "popover", "calendar"],
};
