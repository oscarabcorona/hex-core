import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const switchSchema: ComponentSchemaDefinition = {
	name: "switch",
	displayName: "Switch",
	description: "An accessible toggle switch for instant on/off settings. Built on Radix UI.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{ name: "checked", type: "boolean", required: false, description: "Controlled checked state" },
		{ name: "defaultChecked", type: "boolean", required: false, description: "Default for uncontrolled" },
		{ name: "onCheckedChange", type: "function", required: false, description: "Callback: (checked: boolean) => void" },
		{ name: "disabled", type: "boolean", required: false, default: false, description: "Disable the switch" },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-switch", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["primary", "input", "background", "ring"],
	examples: [
		{
			title: "Basic",
			description: "Switch with label",
			code: '<div className="flex items-center gap-2">\n  <Switch id="airplane" />\n  <Label htmlFor="airplane">Airplane Mode</Label>\n</div>',
			composition: ["form", "boolean"],
		},
		{
			title: "Settings row",
			description: "Right-aligned switch in a settings list — the canonical Apple-style preference UI",
			code: '<div className="flex items-center justify-between py-3">\n  <div>\n    <Label htmlFor="notifications">Email notifications</Label>\n    <p className="text-sm text-muted-foreground">Daily digest, mentions, and replies</p>\n  </div>\n  <Switch id="notifications" />\n</div>',
			composition: ["settings", "preference-row", "boolean"],
		},
	],
	ai: {
		whenToUse:
			"Use for instant-effect boolean settings: dark mode, notifications on/off, feature toggles, airplane mode. The change takes effect immediately — no submit step.",
		whenNotToUse:
			"Don't use for form fields that get submitted in a batch (use Checkbox). Don't use for mutually exclusive options (use RadioGroup). Don't use to filter a list of options (use Toggle or ToggleGroup).",
		commonMistakes: [
			"Using Switch for form fields that need explicit submit",
			"Missing <Label> for the switch — without htmlFor/id pairing, screen readers announce the toggle without context",
			"Putting the switch label INSIDE the switch instead of next to it",
		],
		antiPatterns: [
			{
				mistake: "Using Switch inside a form that gets submitted with a Save button",
				insteadUse: "checkbox",
				why: "Switch implies the change applies immediately. A Save button suggests batch submission — that's Checkbox semantics. Mixing them confuses the user about whether they need to click Save.",
			},
			{
				mistake: "Putting two Switches side-by-side to choose between mutually exclusive options",
				insteadUse: "radio-group",
				why: "Switches don't represent 'pick one of N'. RadioGroup announces the group + the active selection to assistive tech and prevents the user from selecting both.",
			},
		],
		relatedComponents: ["checkbox", "label", "form", "toggle"],
		accessibilityNotes:
			"Always pair with Label (htmlFor / id). Radix handles role='switch' + aria-checked + keyboard activation (Space).",
		tokenBudget: 350,
	},
	tags: ["switch", "toggle", "form", "boolean", "setting"],
};
