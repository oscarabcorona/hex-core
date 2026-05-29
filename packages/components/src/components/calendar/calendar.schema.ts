import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const calendarSchema: ComponentSchemaDefinition = {
	name: "calendar",
	displayName: "Calendar",
	description:
		"Date grid built on react-day-picker v9. Supports single, multiple, and range selection modes. Keyboard navigable and localizable.",
	category: "component",
	subcategory: "input",
	props: [
		{
			name: "mode",
			type: "string",
			required: false,
			default: "single",
			description: "Selection mode: 'single' | 'multiple' | 'range'",
		},
		{
			name: "selected",
			type: "object",
			required: false,
			description: "Controlled selected value (Date, Date[], or DateRange depending on mode)",
		},
		{
			name: "onSelect",
			type: "function",
			required: false,
			description: "Callback when selection changes",
		},
		{
			name: "disabled",
			type: "object",
			required: false,
			description:
				"DayPicker Matcher — accepts a Date, Date[], { from, to }, { before | after }, or a (date: Date) => boolean predicate",
		},
		{
			name: "showOutsideDays",
			type: "boolean",
			required: false,
			default: true,
			description: "Render days from the previous/next month in the grid",
		},
		{
			name: "numberOfMonths",
			type: "number",
			required: false,
			default: 1,
			description: "How many months to display side-by-side",
		},
		{
			name: "defaultMonth",
			type: "object",
			required: false,
			description: "The month to render first (uncontrolled). Date object.",
		},
		{
			name: "fromDate",
			type: "object",
			required: false,
			description: "Earliest selectable date (Date). Days before are disabled.",
		},
		{
			name: "toDate",
			type: "object",
			required: false,
			description: "Latest selectable date (Date). Days after are disabled.",
		},
		{
			name: "locale",
			type: "object",
			required: false,
			description:
				"date-fns Locale object (e.g. `import { es } from 'date-fns/locale'`) for weekday/month labels",
		},
		{
			name: "weekStartsOn",
			type: "number",
			required: false,
			default: 0,
			description: "First day of the week (0 = Sunday, 1 = Monday, …, 6 = Saturday)",
		},
		{
			name: "classNames",
			type: "object",
			required: false,
			description: "Per-part className overrides (merged with defaults)",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["react-day-picker", "date-fns", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["accent", "accent-foreground", "primary", "primary-foreground", "muted-foreground", "ring"],
	examples: [
		{
			title: "Single date selection",
			description: "Bind a Date state to selected/onSelect",
			code: 'import { useState } from "react";\nimport { Calendar } from "@/components/ui/calendar";\n\nexport function Example() {\n  const [date, setDate] = useState<Date | undefined>(new Date());\n  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />;\n}',
		},
		{
			title: "Range selection",
			description: "Pick a start and end date",
			code: 'import { useState } from "react";\nimport type { DateRange } from "react-day-picker";\nimport { Calendar } from "@/components/ui/calendar";\n\nexport function Example() {\n  const [range, setRange] = useState<DateRange | undefined>();\n  return <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />;\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for inline date selection UIs, or as the month-grid inside a DatePicker (wrapped in a Popover). Supports single date, multi-date, and range modes.",
		whenNotToUse:
			"Don't use when only a text date input is needed (use Input type=date). Don't embed inside a very narrow container — the grid needs ~280px min width. For scheduling UIs with time, combine with a separate time picker.",
		commonMistakes: [
			"Passing a string to selected (must be a Date, Date[], or DateRange object)",
			"Forgetting mode prop (default is single, but being explicit avoids confusion)",
			"Overriding classNames completely instead of spreading — loses default styling",
			"Using inside a Server Component without marking the consumer 'use client'",
		],
		relatedComponents: ["date-picker", "popover", "input"],
		accessibilityNotes:
			"react-day-picker wires aria-label, aria-selected, and keyboard navigation (arrows, Home/End, PageUp/Down). Focus rings on day buttons use the ring token.",
		tokenBudget: 1115,
	},
	tags: ["calendar", "date", "date-picker", "input"],
};
