import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const drawerSchema: ComponentSchemaDefinition = {
	name: "drawer",
	displayName: "Drawer",
	description:
		"Bottom-sheet drawer built on vaul. Mobile-native feel: drag-to-dismiss, snap points, body-scale-on-open. Use for quick mobile actions, filters, pickers.",
	category: "component",
	subcategory: "overlay",
	props: [
		{ name: "open", type: "boolean", required: false, description: "Controlled open state" },
		{
			name: "defaultOpen",
			type: "boolean",
			required: false,
			default: false,
			description: "Default open state",
		},
		{
			name: "onOpenChange",
			type: "function",
			required: false,
			description: "Callback when open state changes: (open: boolean) => void",
		},
		{
			name: "shouldScaleBackground",
			type: "boolean",
			required: false,
			default: true,
			description: "Scale the <body> element when the drawer opens (creates depth)",
		},
		{
			name: "snapPoints",
			type: "object",
			required: false,
			description: "Array of snap positions ('40%', 400, '100%') — defines resting heights the user can snap to",
		},
		{
			name: "activeSnapPoint",
			type: "object",
			required: false,
			description: "Controlled active snap point value (matches one entry in snapPoints)",
		},
		{
			name: "closeThreshold",
			type: "number",
			required: false,
			default: 0.25,
			description: "Fraction of height the user must drag down to close (0..1)",
		},
		{
			name: "dismissible",
			type: "boolean",
			required: false,
			default: true,
			description: "Allow drag-to-dismiss and outside-click-to-dismiss",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "DrawerTrigger + DrawerContent (with DrawerHeader/Footer/Title/Description)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["vaul", "@radix-ui/react-dialog", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted", "muted-foreground", "border"],
	examples: [
		{
			title: "Basic drawer",
			description: "Mobile-friendly bottom sheet with a quick action",
			code: '<Drawer>\n  <DrawerTrigger asChild>\n    <Button variant="outline">Open drawer</Button>\n  </DrawerTrigger>\n  <DrawerContent>\n    <DrawerHeader>\n      <DrawerTitle>Edit profile</DrawerTitle>\n      <DrawerDescription>Make changes to your profile.</DrawerDescription>\n    </DrawerHeader>\n    <div className="p-4"><Input placeholder="Name" /></div>\n    <DrawerFooter>\n      <Button>Save</Button>\n      <DrawerClose asChild>\n        <Button variant="outline">Cancel</Button>\n      </DrawerClose>\n    </DrawerFooter>\n  </DrawerContent>\n</Drawer>',
		},
	],
	ai: {
		whenToUse:
			"Use on mobile-first or mobile-primary UX when a native app-like bottom sheet matters. Good for filters, quick pickers, confirm-then-do flows, or anywhere a user expects drag-to-dismiss.",
		whenNotToUse:
			"Don't use on desktop-primary UIs (use Dialog or Sheet). Don't use for side navigation (use Sheet). Don't use for transient info (use Popover or Tooltip). Don't use when you must prevent dismissal — drawers invite drag-down.",
		commonMistakes: [
			"Forgetting DrawerTitle — vaul/Radix warn and screen readers announce an unnamed dialog",
			"Placing long forms inside a drawer without snap points — content gets cramped",
			"Disabling shouldScaleBackground when the background context-cue matters for UX",
			"Wrapping DrawerContent in Portal yourself — DrawerContent already portals via DrawerPortal",
		],
		relatedComponents: ["sheet", "dialog"],
		accessibilityNotes:
			"vaul delegates to Radix Dialog: focus trap, Escape to close, aria-labelledby/describedby wired to DrawerTitle/Description. The top handle is decorative (aria-hidden).",
		tokenBudget: 945,
	},
	tags: ["drawer", "bottom-sheet", "vaul", "mobile", "overlay"],
};
