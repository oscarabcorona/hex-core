import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const alertDialogSchema: ComponentSchemaDefinition = {
	name: "alert-dialog",
	displayName: "Alert Dialog",
	description:
		"A modal dialog for destructive confirmations. The user must explicitly accept or cancel — there is no close button. Built on Radix UI AlertDialog.",
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
			description: "Callback fired on open state change: (open: boolean) => void",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description:
				"AlertDialogTrigger + AlertDialogContent (with Header, Footer, Action, Cancel)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-alert-dialog", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"background",
		"foreground",
		"muted-foreground",
		"destructive",
		"destructive-foreground",
		"accent",
		"accent-foreground",
		"border",
		"input",
		"ring",
	],
	examples: [
		{
			title: "Destructive confirmation",
			description: "Confirm before deleting a resource",
			code: '<AlertDialog>\n  <AlertDialogTrigger asChild>\n    <Button variant="destructive">Delete account</Button>\n  </AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>\n      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>\n      <AlertDialogDescription>\n        This action cannot be undone. This will permanently delete your account.\n      </AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>Cancel</AlertDialogCancel>\n      <AlertDialogAction>Yes, delete</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>',
		},
	],
	ai: {
		whenToUse:
			"Use for destructive or irreversible confirmations: delete account, discard changes, permanent actions. The user must explicitly choose Action or Cancel.",
		whenNotToUse:
			"Don't use for non-destructive dialogs (use Dialog). Don't use for simple notifications (use Toast). Don't use when there's only one action to take.",
		commonMistakes: [
			"Using Dialog when AlertDialog is semantically required",
			"Omitting AlertDialogCancel (user must have an escape hatch)",
			"Putting more than one AlertDialogAction (the pattern expects one destructive action)",
			"Making the action button non-destructive styled",
		],
		relatedComponents: ["dialog", "sonner"],
		accessibilityNotes:
			"Radix sets role='alertdialog', traps focus, focuses AlertDialogCancel by default, and closes on Escape. Clicks outside the dialog are prevented (user must choose Cancel or Action).",
		tokenBudget: 631,
	},
	tags: ["alert-dialog", "confirm", "destructive", "modal", "overlay"],
};
