import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const colorPickerSchema: ComponentSchemaDefinition = {
	name: "color-picker",
	displayName: "Color Picker",
	description:
		"HSL-native color picker that edits an HSL triplet directly via three sliders (H/S/L). Hex input is a display adapter; sliders are the source of truth so the value round-trips losslessly through the `@hex-core/tokens` triplet format.",
	category: "component",
	subcategory: "input",
	props: [
		{
			name: "value",
			type: "string",
			required: true,
			description:
				"Current color as an HSL triplet string (`\"<H> <S>% <L>%\"`, e.g. `\"240 5.9% 10%\"`). Match the format used by `@hex-core/tokens`.",
		},
		{
			name: "onChange",
			type: "function",
			required: true,
			description:
				"Called with the next HSL triplet when the user drags a slider or commits a valid hex value. Not called for invalid hex input.",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description:
				"Disable interaction. Trigger renders dimmed; mouse and keyboard activation are blocked by the native `disabled` attribute.",
		},
		{
			name: "aria-label",
			type: "string",
			required: false,
			default: '"Pick color"',
			description: "Accessible name for the trigger button.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional class names merged onto the trigger.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-popover", "@radix-ui/react-slider", "@radix-ui/react-label"],
		internal: [
			"primitives/slider/slider",
			"primitives/input/input",
			"primitives/label/label",
			"components/popover/popover",
			"lib/color",
			"lib/utils",
		],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["input", "background", "ring", "border", "muted-foreground"],
	examples: [
		{
			title: "Edit a token live",
			description: "Bind a state variable to a CSS custom property to preview a token edit in real time.",
			code: 'const [color, setColor] = React.useState("240 5.9% 10%");\n\nreturn (\n  <div style={{ "--primary": color } as React.CSSProperties}>\n    <ColorPicker value={color} onChange={setColor} aria-label="Primary color" />\n    <Button>Live preview</Button>\n  </div>\n);',
		},
		{
			title: "Disabled",
			description: "Prevent edits while a parent operation is in flight.",
			code: '<ColorPicker value="240 5.9% 10%" onChange={() => {}} disabled />',
		},
	],
	ai: {
		whenToUse:
			"Use whenever the user is editing a color that will round-trip through the `@hex-core/tokens` HSL triplet format — token editors, theme builders, branding panels, custom-color surfaces in design tools.",
		whenNotToUse:
			"Don't use for picking a color from a fixed palette — use a `Select` or `RadioGroup` of swatches. Don't use for image-based color sampling (eyedropper) — that's a separate primitive. Don't reach for ColorPicker when only a hex string matters: bind it directly to `<input type=\"color\">` for the simplest cases.",
		commonMistakes: [
			"Treating the value as hex — the prop is an HSL triplet, not a hex string. Use `hexToHslTriplet` and `hslTripletToHex` from `@hex-core/components/lib/color` if you need to bridge.",
			"Forgetting to wrap the value in `hsl(...)` when applying it as a CSS color: `style={{ color: \\`hsl(${value})\\` }}`.",
			"Calling `onChange` synchronously inside a parent's render — the picker batches slider updates and that pattern can desync controlled state.",
		],
		relatedComponents: ["slider", "input", "label", "popover"],
		accessibilityNotes:
			"Each slider has a per-axis `aria-label` (Hue / Saturation / Lightness). The trigger button needs an explicit `aria-label` describing what color is being edited (e.g. `\"Primary color\"`) — the default `\"Pick color\"` is generic. The hex input is keyboard-accessible and round-trips with the sliders.",
		tokenBudget: 936,
	},
	tags: ["color-picker", "color", "hsl", "hex", "form", "theme-editor", "primitive"],
};
