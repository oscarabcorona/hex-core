import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const dialogSchema: ComponentSchemaDefinition = {
	name: "dialog",
	displayName: "Dialog",
	description:
		"A modal dialog that interrupts the user with important content. Built on Radix UI with focus trap, escape handling, and scroll lock.",
	category: "component",
	subcategory: "overlay",
	props: [
		{
			name: "open",
			type: "boolean",
			required: false,
			description: "Controlled open state",
		},
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
			description: "Callback fired when open state changes: (open: boolean) => void",
		},
		{
			name: "modal",
			type: "boolean",
			required: false,
			default: true,
			description: "When true, content outside the dialog is inert",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "DialogTrigger + DialogContent (with DialogHeader, DialogFooter, etc.)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-dialog", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "border", "ring"],
	examples: [
		{
			title: "Basic dialog",
			description: "Dialog with title, description, and action buttons",
			code: '<Dialog>\n  <DialogTrigger asChild>\n    <Button variant="outline">Edit Profile</Button>\n  </DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Edit profile</DialogTitle>\n      <DialogDescription>Make changes to your profile here.</DialogDescription>\n    </DialogHeader>\n    <div className="grid gap-4 py-4">\n      <Input placeholder="Name" />\n    </div>\n    <DialogFooter>\n      <Button>Save changes</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>',
		},
	],
	ai: {
		whenToUse:
			"Use for focused, interruptive tasks: confirmations, quick forms, detail views. The user must address the dialog before continuing.",
		whenNotToUse:
			"Don't use for destructive confirmations (use AlertDialog). Don't use for complex multi-step flows (use a full page). Don't use for non-critical info (use Tooltip or Popover).",
		commonMistakes: [
			"Nesting dialogs inside each other",
			"Forgetting DialogTitle (breaks accessibility — screen readers need it)",
			"Using DialogDescription for long-form content (keep it short)",
			"Putting too many primary actions in DialogFooter",
		],
		relatedComponents: ["alert-dialog", "popover", "sheet"],
		accessibilityNotes:
			"Radix traps focus, handles Escape to close, and wires aria-labelledby/describedby to DialogTitle/DialogDescription. Always include a DialogTitle. DialogContent is constrained to `max-h-[calc(100vh-2rem)]` and scrolls internally so long content stays inside the focus trap.",
		tokenBudget: 600,
	},
	tags: ["dialog", "modal", "overlay", "popup", "form"],
};
