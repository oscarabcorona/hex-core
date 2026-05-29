import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sliderSchema: ComponentSchemaDefinition = {
	name: "slider",
	displayName: "Slider",
	description:
		"A range input with draggable thumbs. Supports single value, ranges (two thumbs), custom steps, and full keyboard control.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{
			name: "value",
			type: "object",
			required: false,
			description:
				"Controlled array of thumb values (number[]), e.g. [50] for single, [20, 80] for range",
		},
		{
			name: "defaultValue",
			type: "object",
			required: false,
			description: "Default array of thumb values (number[]) for uncontrolled usage",
		},
		{
			name: "onValueChange",
			type: "function",
			required: false,
			description: "Callback on value change: (value: number[]) => void",
		},
		{ name: "min", type: "number", required: false, default: 0, description: "Minimum value" },
		{ name: "max", type: "number", required: false, default: 100, description: "Maximum value" },
		{
			name: "step",
			type: "number",
			required: false,
			default: 1,
			description: "Step interval between valid values",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the slider",
		},
		{
			name: "orientation",
			type: "enum",
			required: false,
			default: "horizontal",
			description: "Slider direction",
			enumValues: ["horizontal", "vertical"],
		},
		{
			name: "aria-label",
			type: "string",
			required: false,
			description:
				"Accessible label for the slider as a whole. Mirrored onto a single thumb automatically; for range sliders prefer thumbLabels.",
		},
		{
			name: "aria-labelledby",
			type: "string",
			required: false,
			description: "Id of an external visible label that names the slider.",
		},
		{
			name: "thumbLabels",
			type: "object",
			required: false,
			description:
				"Per-thumb accessible labels (string[]). Required for range sliders so each thumb has a meaningful name (e.g. ['Minimum price', 'Maximum price']). For a single-thumb slider, the Root's aria-label is mirrored onto the thumb automatically and thumbLabels is only needed when overriding that default.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-slider", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["secondary", "primary", "background", "ring"],
	examples: [
		{
			title: "Volume control with display",
			description: "Single-thumb slider paired with the live numeric value — the canonical 'continuous range with feedback' pattern",
			code: 'function VolumeControl() {\n  const [value, setValue] = React.useState([60]);\n  return (\n    <div className="space-y-2">\n      <div className="flex justify-between text-sm">\n        <Label htmlFor="vol">Volume</Label>\n        <span className="text-muted-foreground tabular-nums">{value[0]}%</span>\n      </div>\n      <Slider id="vol" value={value} onValueChange={setValue} max={100} step={1} aria-label="Volume" />\n    </div>\n  );\n}',
			composition: ["form", "settings", "continuous-range", "with-display"],
		},
		{
			title: "Price-range filter",
			description: "Two-thumb range slider with per-thumb labels — the canonical e-commerce filter UI",
			code: '<Slider\n  defaultValue={[20, 80]}\n  max={100}\n  step={1}\n  thumbLabels={["Minimum price", "Maximum price"]}\n/>',
			composition: ["filter", "range", "ecommerce"],
		},
	],
	ai: {
		whenToUse:
			"Use for continuous numeric inputs with a known range: volume, brightness, price range filter, opacity. Pair value with a visible number display when the exact value matters.",
		whenNotToUse:
			"Don't use when the user needs to enter an exact number (use Input type=number). Don't use for discrete choices (use Select or RadioGroup). Don't use for boolean on/off (use Switch).",
		commonMistakes: [
			"Using Slider for exact values without showing the number",
			"Missing min/max bounds",
			"Using step=1 for fractional values (set step=0.01)",
			"Not providing aria-label / aria-labelledby when there's no visible label",
			"Range slider with only Root aria-label and no thumbLabels — both thumbs fall back to '(N of 2)' indexed names instead of meaningful per-thumb labels",
			"thumbLabels.length !== value.length — extra labels are ignored, missing labels fall back to indexed names (dev-mode warning)",
		],
		antiPatterns: [
			{
				mistake: "Using Slider with min=0/max=1 to represent on/off",
				insteadUse: "switch",
				why: "Slider is 'continuous range'. Switch is 'boolean'. Assistive tech announces them differently — Slider says '0 of 1, 1 of 1'; Switch says 'on / off'. Always reach for Switch when the values are binary.",
			},
			{
				mistake: "Using Slider for picking a number from a small discrete set (1–5 rating, 'pages per row')",
				insteadUse: "radio-group",
				why: "Sliders make exact target values hard to land on. RadioGroup gives 5 buttons that name themselves and are easier with assistive tech. Reach for Slider only when 50+ values are valid.",
			},
			{
				mistake: "Using Slider for the user to type a known exact number (price, age, count)",
				insteadUse: "input",
				why: "Drag-to-set is slower and less accurate than typing. Use <Input type='number'> when the user has the exact value in mind.",
			},
		],
		relatedComponents: ["input", "switch", "radio-group"],
		accessibilityNotes:
			"Arrow keys step by step, Home/End jump to min/max, PageUp/PageDown step larger. Radix handles aria-valuemin/max/now. Each thumb has its own accessible name: explicit via thumbLabels[i], else mirrored from the Root's aria-label (single thumb) or indexed '(i of N)' fallback (range). Add aria-label / aria-labelledby on the Root when there's no visible label.",
		tokenBudget: 1500,
	},
	tags: ["slider", "range", "form", "numeric", "input"],
};
