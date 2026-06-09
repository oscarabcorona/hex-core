import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const stepperSchema: ComponentSchemaDefinition = {
	name: "stepper",
	displayName: "Stepper",
	description:
		"Linear progress indicator for multi-step flows (form wizards, onboarding, checkout). Pure semantic <ol>/<li> with aria-current='step' on the active step and a per-step error status override.",
	category: "component",
	subcategory: "navigation",
	props: [
		{
			name: "steps",
			type: "object",
			required: true,
			description:
				"Ordered list of { id, label, description?, disabled?, status? }. `status` overrides the index-derived value.",
		},
		{
			name: "current",
			type: "number",
			required: true,
			description: "Index of the current step (controlled).",
		},
		{
			name: "orientation",
			type: "string",
			required: false,
			default: "horizontal",
			description: "Layout direction: 'horizontal' | 'vertical'",
		},
		{
			name: "size",
			type: "string",
			required: false,
			default: "default",
			description: "Indicator size: 'sm' | 'default' | 'lg'",
		},
		{
			name: "onStepClick",
			type: "function",
			required: false,
			description:
				"When provided, each step renders as a clickable <button>; otherwise steps are non-interactive <span>s. Signature: (index: number) => void",
		},
		{
			name: "aria-label",
			type: "string",
			required: true,
			description:
				"Required accessible name for the ordered list (e.g. 'Onboarding steps', 'Checkout progress')",
		},
	],
	variants: [
		{
			name: "orientation",
			description: "Layout direction",
			values: [
				{ value: "horizontal", description: "Steps laid out left-to-right" },
				{ value: "vertical", description: "Steps stacked top-to-bottom" },
			],
			default: "horizontal",
		},
		{
			name: "size",
			description: "Indicator size",
			values: [
				{ value: "sm", description: "Compact indicator (1.75rem)" },
				{
					value: "default",
					description: "Default indicator (matches control-height-sm)",
				},
				{
					value: "lg",
					description: "Large indicator (matches control-height-md)",
				},
			],
			default: "default",
		},
	],
	slots: [],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"primary",
		"primary-foreground",
		"foreground",
		"muted-foreground",
		"input",
		"destructive",
		"destructive-foreground",
		"ring",
	],
	examples: [
		{
			title: "Form wizard",
			description:
				"Three-step horizontal stepper with the second step active",
			code: 'import { Stepper } from "@/components/ui/stepper";\n\nexport function Example() {\n  return (\n    <Stepper\n      aria-label="Onboarding"\n      current={1}\n      steps={[\n        { id: "account", label: "Account", description: "Email + password" },\n        { id: "profile", label: "Profile", description: "Name + photo" },\n        { id: "confirm", label: "Confirm" },\n      ]}\n    />\n  );\n}',
		},
		{
			title: "With error state",
			description: "Mark a failed step explicitly with status='error'",
			code: 'import { Stepper } from "@/components/ui/stepper";\n\nexport function Example() {\n  return (\n    <Stepper\n      aria-label="Checkout"\n      current={2}\n      steps={[\n        { id: "cart", label: "Cart" },\n        { id: "shipping", label: "Shipping", status: "error" },\n        { id: "payment", label: "Payment" },\n      ]}\n    />\n  );\n}',
		},
		{
			title: "Vertical, clickable",
			description: "Vertical orientation with onStepClick to jump back",
			code: 'import { Stepper } from "@/components/ui/stepper";\n\nexport function Example() {\n  return (\n    <Stepper\n      aria-label="Settings"\n      orientation="vertical"\n      current={1}\n      onStepClick={(i) => console.log(i)}\n      steps={[\n        { id: "profile", label: "Profile" },\n        { id: "security", label: "Security" },\n        { id: "billing", label: "Billing" },\n      ]}\n    />\n  );\n}',
		},
	],
	ai: {
		whenToUse:
			"Use to communicate progress through a multi-step flow with a known fixed sequence: form wizards, onboarding, checkout, ticket triage. Mark per-step error status when validation fails.",
		whenNotToUse:
			"Don't use for free navigation across unrelated sections (use Tabs). Don't use for indeterminate progress (use Progress with no value). Don't use for >7 steps — collapse into a multi-screen wizard with a sub-stepper instead.",
		commonMistakes: [
			"Forgetting aria-label — the <ol> needs an accessible name to be understood as a step list",
			"Setting current to an out-of-range index — derives all steps as 'upcoming'",
			"Mixing index-derived status with manual status overrides without intent — once you set status on one step, set it on all of them or know the precedence rules",
			"Making the stepper interactive (onStepClick) but allowing forward jumps before validation — gate jumps in your handler",
			"Treating it as a tab control — Stepper communicates direction; users can't pick step 5 then go back to 2 to review without your wiring",
		],
		relatedComponents: ["progress", "tabs", "breadcrumb"],
		accessibilityNotes:
			"Renders <ol> with the provided aria-label. The active step's interactive element gets aria-current='step'. Completed steps prefix the label with visually-hidden 'Completed:'; error steps prefix with 'Error:' and set aria-invalid='true' on the indicator. Connector lines are aria-hidden. When onStepClick is omitted, steps are plain <span>s — not fake buttons.",
		tokenBudget: 1370,
	},
	tags: ["stepper", "wizard", "progress", "navigation", "form"],
};
