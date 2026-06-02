import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const sheetSchema: ComponentSchemaDefinition = {
	name: "sheet",
	displayName: "Sheet",
	description:
		"Side drawer built on Radix Dialog with a directional slide animation. Use for navigation, filters, quick edit, or any off-canvas panel.",
	category: "component",
	subcategory: "overlay",
	props: [
		{ name: "open", type: "boolean", required: false, description: "Controlled open state" },
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: false,
			description: "Default open state for uncontrolled usage",
		},
		{
			name: "onOpenChange",
			type: "function",
			required: false,
			description: "Callback when open state changes: (open: boolean) => void",
		},
		{
			name: "modal",
			type: "boolean",
			required: false,
			default: true,
			description: "When true, content outside the sheet is inert",
		},
	],
	variants: [
		{
			name: "side",
			description: "Which edge the sheet slides in from",
			values: [
				{ value: "top", description: "Slides down from the top edge" },
				{ value: "bottom", description: "Slides up from the bottom edge" },
				{ value: "left", description: "Slides in from the left edge" },
				{ value: "right", description: "Slides in from the right edge (default)" },
			],
			default: "right",
		},
	],
	slots: [
		{
			name: "children",
			description: "SheetTrigger + SheetContent (with SheetHeader/Footer/Title/Description)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-dialog", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "border", "ring"],
	examples: [
		{
			title: "Right-side sheet",
			description: "Quick edit panel anchored to the right edge",
			code: '<Sheet>\n  <SheetTrigger asChild>\n    <Button variant="outline">Open</Button>\n  </SheetTrigger>\n  <SheetContent>\n    <SheetHeader>\n      <SheetTitle>Edit profile</SheetTitle>\n      <SheetDescription>Make changes and save when done.</SheetDescription>\n    </SheetHeader>\n    <div className="grid gap-4 py-4">\n      <Input placeholder="Name" />\n    </div>\n    <SheetFooter>\n      <Button>Save</Button>\n    </SheetFooter>\n  </SheetContent>\n</Sheet>',
		},
	],
	ai: {
		whenToUse:
			"Use for off-canvas panels — mobile nav menus, filter panels, side forms, detail views, or multi-step flows. Slides in from an edge, dismisses on outside click, Escape, or close button.",
		whenNotToUse:
			"Don't use for center-focused modals (use Dialog). Don't use for transient bottom sheets on mobile (use Drawer). Don't use for dropdown menus or quick popover actions (use DropdownMenu or Popover).",
		commonMistakes: [
			"Forgetting SheetTitle — Radix warns at runtime and screen readers announce an unnamed dialog",
			"Putting a full page's content inside a sheet — too much friction; use a route instead",
			"Overriding the side slide animation without matching the 'side' variant",
			"Not handling controlled open state after SheetClose — use onOpenChange not manual state",
		],
		relatedComponents: ["dialog", "drawer", "popover"],
		accessibilityNotes:
			"Radix traps focus, handles Escape to close, and wires aria-labelledby/describedby to SheetTitle/Description. The Close button has sr-only text. Always include a SheetTitle.",
		tokenBudget: 861,
	},
	tags: ["sheet", "drawer", "side-panel", "off-canvas", "overlay"],
};
