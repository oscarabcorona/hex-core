import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const confirmationSchema: ComponentSchemaDefinition = {
	name: "confirmation",
	displayName: "Confirmation",
	description:
		"Destructive-action confirmation gate. Wraps Radix AlertDialog with an AI-aware shape: title, description, severity (info / warning / danger), and a paired confirm / cancel callback. Severity drives the confirm button's variant.",
	category: "ai",
	subcategory: "agent",
	props: [
		{
			name: "trigger",
			type: "ReactNode",
			required: false,
			description: "The element that opens the dialog when clicked. Required when uncontrolled — omit when driving via the `open` prop.",
		},
		{
			name: "title",
			type: "ReactNode",
			required: true,
			description: "Headline question or statement.",
		},
		{
			name: "description",
			type: "ReactNode",
			required: false,
			description: "Optional secondary description.",
		},
		{
			name: "severity",
			type: "enum",
			required: false,
			default: "warning",
			description: "Severity of the action — drives the confirm-button variant. `\"danger\"` flips it to destructive.",
			enumValues: ["info", "warning", "danger"],
		},
		{
			name: "confirmLabel",
			type: "ReactNode",
			required: false,
			description: "Override the confirm button label. Defaults to severity-appropriate text (\"OK\" / \"Continue\" / \"Delete\").",
		},
		{
			name: "cancelLabel",
			type: "ReactNode",
			required: false,
			default: "Cancel",
			description: "Override the cancel button label.",
		},
		{
			name: "onConfirm",
			type: "function",
			required: true,
			description: "Called when the user confirms. May return a Promise — the button shows the busy state until it resolves.",
		},
		{
			name: "onCancel",
			type: "function",
			required: false,
			description: "Called when the user cancels (or dismisses).",
		},
		{
			name: "open",
			type: "boolean",
			required: false,
			description: "Controlled visibility.",
		},
		{
			name: "onOpenChange",
			type: "function",
			required: false,
			description: "Visibility change handler — required when `open` is set.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the dialog content panel.",
		},
	],
	variants: [],
	slots: [
		{
			name: "trigger",
			description: "The element that opens the dialog. Typically a `<Button>`.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-alert-dialog", "@radix-ui/react-slot", "clsx", "tailwind-merge", "class-variance-authority"],
		internal: ["lib/utils", "primitives/button/button"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "primary", "destructive", "border"],
	examples: [
		{
			title: "Delete-account danger confirmation",
			description: "Severity `\"danger\"` flips the confirm button to destructive styling.",
			code: '<Confirmation\n  trigger={<Button variant="destructive">Delete account</Button>}\n  title="Delete your account?"\n  description="This action cannot be undone. All conversations and tool history will be lost."\n  severity="danger"\n  confirmLabel="Delete"\n  onConfirm={() => deleteAccount()}\n/>',
			composition: ["agent", "destructive", "alert-dialog"],
		},
		{
			title: "Async confirm with busy state",
			description: "Return a Promise from `onConfirm` and the dialog stays open with a loading spinner until it resolves.",
			code: '<Confirmation\n  trigger={<Button>Run the migration</Button>}\n  title="Run the migration?"\n  description="This will dual-write for 6 hours."\n  severity="warning"\n  onConfirm={async () => {\n    await api.runMigration();\n    toast.success("Migration started");\n  }}\n/>',
			composition: ["agent", "async", "alert-dialog"],
		},
		{
			title: "Controlled visibility",
			description: "Drive `open` from external state when the dialog is triggered programmatically (e.g. by an agent emitting a confirmation request).",
			code: 'const [pending, setPending] = useState<{ id: string } | null>(null);\n<Confirmation\n  open={pending !== null}\n  onOpenChange={(o) => !o && setPending(null)}\n  title="Approve agent action?"\n  description={pending?.id ? `Run tool ${pending.id}` : ""}\n  severity="warning"\n  onConfirm={() => approve(pending!.id)}\n  onCancel={() => deny(pending!.id)}\n/>',
			composition: ["agent", "controlled"],
		},
	],
	ai: {
		whenToUse:
			"Wherever an agent or user kicks off a destructive / hard-to-reverse action: deleting data, running a migration, sending a message that fans out, executing an unsafe tool. Severity `\"danger\"` is the canonical fit for the destructive cluster; `\"warning\"` for risky-but-reversible.",
		whenNotToUse:
			"Don't use for routine confirmations like \"Save\" (use a regular dialog or no dialog). Don't use for non-modal flows (use `<Plan>` for pre-execution review with no modal interruption). Don't use as a dialog primitive for arbitrary content (use `<Dialog>` — `<Confirmation>` is shaped specifically for the title/description/confirm/cancel pattern).",
		commonMistakes: [
			"Setting severity to `\"danger\"` for any non-trivial confirmation — reserve danger for irreversible / data-loss actions; using it everywhere desensitizes users to the destructive button color",
			"Forgetting to await async work in `onConfirm` — return the Promise so the dialog stays open with the busy state, otherwise the dialog closes mid-request and the user thinks the action completed",
			"Passing `open` without `onOpenChange` — controlled mode requires both; without the handler the dialog can't close after confirm/cancel",
			"Putting essential context in `confirmLabel` instead of `description` — the description is where users absorb consequences; the confirm label should be a short verb (\"Delete\", \"Continue\")",
		],
		relatedComponents: ["alert-dialog", "dialog", "plan", "button"],
		accessibilityNotes:
			"Wraps Radix AlertDialog — content is portalled into the body, focus is trapped inside, Escape cancels, Enter on the confirm button activates. The severity icon carries an aria-label (\"Danger\" / \"Warning\" / \"Info\") so AT users hear the severity even without color cues. The confirm button shows a busy spinner via `aria-busy` while an async `onConfirm` is in flight.",
		tokenBudget: 280,
	},
	tags: ["ai", "agent", "confirmation", "destructive", "alert-dialog", "modal"],
};
