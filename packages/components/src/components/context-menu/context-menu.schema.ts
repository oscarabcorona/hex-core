import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const contextMenuSchema: ComponentSchemaDefinition = {
	name: "context-menu",
	displayName: "Context Menu",
	description: "Right-click (or long-press on touch) menu anchored to the trigger region. Same item vocabulary as DropdownMenu.",
	category: "component",
	subcategory: "overlay",
	props: [
		{ name: "onOpenChange", type: "function", required: false, description: "Callback on open change" },
		{ name: "modal", type: "boolean", required: false, default: true, description: "When true, interaction outside is blocked" },
		{ name: "dir", type: "enum", required: false, description: "Reading direction", enumValues: ["ltr", "rtl"] },
	],
	variants: [],
	slots: [
		{
			name: "children",
			description:
				"ContextMenuTrigger + ContextMenuContent. Content accepts ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioGroup/ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, and ContextMenuShortcut.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-context-menu", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["popover", "popover-foreground", "accent", "accent-foreground", "border", "foreground", "muted-foreground"],
	examples: [
		{
			title: "Right-click menu",
			description: "Right-click the trigger region for actions",
			code: '<ContextMenu>\n  <ContextMenuTrigger className="flex h-40 items-center justify-center rounded-md border border-dashed">Right-click here</ContextMenuTrigger>\n  <ContextMenuContent>\n    <ContextMenuItem>Back</ContextMenuItem>\n    <ContextMenuItem disabled>Forward</ContextMenuItem>\n    <ContextMenuSeparator />\n    <ContextMenuItem>Reload<ContextMenuShortcut>\u2318R</ContextMenuShortcut></ContextMenuItem>\n  </ContextMenuContent>\n</ContextMenu>',
		},
	],
	ai: {
		whenToUse:
			"Use for right-click menus on a specific region: file-manager-style actions, canvas/editor context actions, row-level actions in tables.",
		whenNotToUse:
			"Don't use for actions triggered by a button (use DropdownMenu). Don't use as the only way to access an action — must have a keyboard/button alternative.",
		commonMistakes: [
			"Using ContextMenu as the only affordance (unreachable on touch)",
			"Triggering on the whole document (put it on a specific region)",
			"Missing a keyboard alternative for items",
		],
		relatedComponents: ["dropdown-menu", "menubar"],
		accessibilityNotes:
			"Triggered via right-click or Shift+F10 on keyboard. Radix handles role='menu', aria-labelledby, focus management.",
		tokenBudget: 593,
	},
	tags: ["context-menu", "right-click", "menu", "actions"],
};
