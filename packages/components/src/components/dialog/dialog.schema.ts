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
			title: "Edit profile",
			description: "Dialog wrapping a short form — the canonical 'edit detail in place' pattern",
			code: '<Dialog>\n  <DialogTrigger asChild>\n    <Button variant="outline">Edit Profile</Button>\n  </DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Edit profile</DialogTitle>\n      <DialogDescription>Make changes to your profile here.</DialogDescription>\n    </DialogHeader>\n    <div className="grid gap-4 py-4">\n      <Input placeholder="Name" />\n    </div>\n    <DialogFooter>\n      <Button>Save changes</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>',
			composition: ["form", "edit-in-place"],
		},
		{
			title: "Confirm dialog",
			description: "Non-destructive confirmation with primary + secondary actions",
			code: '<Dialog>\n  <DialogTrigger asChild>\n    <Button>Publish post</Button>\n  </DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Publish post?</DialogTitle>\n      <DialogDescription>Your followers will be notified by email.</DialogDescription>\n    </DialogHeader>\n    <DialogFooter>\n      <DialogClose asChild>\n        <Button variant="secondary">Cancel</Button>\n      </DialogClose>\n      <Button>Publish</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>',
			composition: ["confirm", "form-action"],
		},
	],
	ai: {
		whenToUse:
			"Use for focused, interruptive tasks: short forms, confirmations, detail views. The user must address the dialog before continuing.",
		whenNotToUse:
			"Don't use for destructive confirmations (use AlertDialog). Don't use for complex multi-step flows (use a full page). Don't use for non-critical info (use Tooltip or Popover). Don't use for mobile-bottom-sheet patterns (use Drawer).",
		commonMistakes: [
			"Nesting dialogs inside each other",
			"Forgetting DialogTitle (breaks accessibility — screen readers need it)",
			"Using DialogDescription for long-form content (keep it short)",
			"Putting too many primary actions in DialogFooter",
		],
		antiPatterns: [
			{
				mistake: "Using <Dialog> for irreversible actions like Delete account",
				insteadUse: "alert-dialog",
				why: "AlertDialog uses role='alertdialog' which forces the user to interact (cannot click-outside to dismiss) and announces destructively to screen readers. Dialog can be dismissed by clicking the overlay — the wrong default for delete confirmations.",
			},
			{
				mistake: "Using <Dialog> for a long multi-step wizard",
				insteadUse: "stepper",
				why: "Modals trap focus and disable scroll on the page below — that fights long content. Multi-step flows belong on a full page with a Stepper for orientation.",
			},
			{
				mistake: "Using <Dialog> for the mobile-only 'pull up from bottom' interaction",
				insteadUse: "drawer",
				why: "Drawer is purpose-built for the bottom-sheet gesture (swipe handle, drag-to-dismiss). Dialog will technically work but loses the native-feeling affordance.",
			},
			{
				mistake: "Putting two equal-weight primary buttons in DialogFooter ('Save and continue' + 'Save and close')",
				insteadUse: "button",
				why: "Two primaries dilute the call to action — users hesitate. Pick one primary; demote the other to secondary or split them via a DropdownMenu attached to a single Button.",
			},
		],
		relatedComponents: ["alert-dialog", "popover", "sheet", "drawer"],
		accessibilityNotes:
			"Radix traps focus, handles Escape to close, and wires aria-labelledby/describedby to DialogTitle/DialogDescription. Always include a DialogTitle. DialogContent is constrained to `max-h-[calc(100vh-2rem)]` and scrolls internally so long content stays inside the focus trap.",
		tokenBudget: 1219,
	},
	tags: ["dialog", "modal", "overlay", "popup", "form"],
};
