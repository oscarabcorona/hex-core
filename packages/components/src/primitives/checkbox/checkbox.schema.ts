import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const checkboxSchema: ComponentSchemaDefinition = {
	name: "checkbox",
	displayName: "Checkbox",
	description: "An accessible checkbox with checked, unchecked, and indeterminate states. Built on Radix UI.",
	category: "primitive",
	subcategory: "forms",
	props: [
		{ name: "checked", type: "boolean", required: false, description: "Controlled checked state" },
		{ name: "defaultChecked", type: "boolean", required: false, description: "Default checked for uncontrolled" },
		{ name: "onCheckedChange", type: "function", required: false, description: "Callback: (checked: boolean | 'indeterminate') => void" },
		{ name: "disabled", type: "boolean", required: false, default: false, description: "Disable the checkbox" },
		{ name: "required", type: "boolean", required: false, default: false, description: "Mark as required for form validation" },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-checkbox", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["input", "primary", "primary-foreground", "ring"],
	examples: [
		{ title: "Basic", description: "Checkbox with label", code: '<div className="flex items-center gap-2">\n  <Checkbox id="terms" />\n  <Label htmlFor="terms">Accept terms</Label>\n</div>' },
		{ title: "Controlled", description: "Controlled checkbox", code: 'const [checked, setChecked] = useState(false);\n<Checkbox checked={checked} onCheckedChange={setChecked} />' },
		{
			title: "Indeterminate (parent/children)",
			description: "Parent renders a dash when some (but not all) children are selected",
			code: 'const [items, setItems] = useState({ email: true, push: false });\nconst count = Object.values(items).filter(Boolean).length;\nconst parent = count === 0 ? false : count === 2 ? true : "indeterminate";\n\n<Checkbox\n  checked={parent}\n  onCheckedChange={(v) => setItems({ email: v === true, push: v === true })}\n/>',
		},
	],
	ai: {
		whenToUse: "Use for boolean toggles in forms (agree to terms, enable options), multi-select lists, or parent/children trees where the parent reflects partial selection via the `indeterminate` state.",
		whenNotToUse: "Don't use for mutually exclusive options (use RadioGroup). Don't use for instant toggles (use Switch).",
		commonMistakes: [
			"Missing Label pairing",
			"Using onChange instead of onCheckedChange",
			"Forgetting that onCheckedChange can receive 'indeterminate' as well as boolean",
		],
		relatedComponents: ["label", "switch", "form"],
		accessibilityNotes: "Always pair with Label via htmlFor/id. Radix handles aria-checked automatically.",
		tokenBudget: 719,
	},
	tags: ["checkbox", "form", "toggle", "boolean", "check"],
};
