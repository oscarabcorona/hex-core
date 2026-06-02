import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const dropdownMenuSchema: ComponentSchemaDefinition = {
	name: "dropdown-menu",
	displayName: "Dropdown Menu",
	description:
		"A menu of actions displayed to the user when a trigger is activated. Supports items, checkboxes, radio groups, sub-menus, and keyboard shortcuts.",
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
			description: "Callback on open state change: (open: boolean) => void",
		},
		{
			name: "modal",
			type: "boolean",
			required: false,
			default: true,
			description: "When true, interaction outside the menu is blocked",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "DropdownMenuTrigger + DropdownMenuContent (with Items, CheckboxItems, etc.)",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-dropdown-menu", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["popover", "popover-foreground", "accent", "accent-foreground", "muted", "muted-foreground", "border"],
	examples: [
		{
			title: "Basic dropdown",
			description: "Standard action menu",
			code: '<DropdownMenu>\n  <DropdownMenuTrigger asChild>\n    <Button variant="outline">Open Menu</Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuLabel>My Account</DropdownMenuLabel>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem>Profile</DropdownMenuItem>\n    <DropdownMenuItem>Settings</DropdownMenuItem>\n    <DropdownMenuItem>\n      Log out\n      <DropdownMenuShortcut>\u2318Q</DropdownMenuShortcut>\n    </DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>',
		},
	],
	ai: {
		whenToUse:
			"Use for action menus triggered by a button: user menus, row-action menus, toolbar overflow. Include DropdownMenuLabel for context, DropdownMenuSeparator for grouping.",
		whenNotToUse:
			"Don't use for navigation between pages (use NavigationMenu or links). Don't use for selection inputs (use Select or Combobox). Don't use for right-click menus (use ContextMenu).",
		commonMistakes: [
			"Using DropdownMenu as a form Select (use Select instead)",
			"Putting interactive elements directly in the trigger without asChild",
			"Too many items without grouping (use DropdownMenuLabel + DropdownMenuSeparator)",
			"Forgetting DropdownMenuShortcut for keyboard-accessible actions",
		],
		relatedComponents: ["select", "context-menu", "popover"],
		accessibilityNotes:
			"Full keyboard navigation: arrow keys, Home, End, typeahead, Escape. Radix handles role='menu', role='menuitem', and aria-labelledby.",
		tokenBudget: 676,
	},
	tags: ["dropdown", "menu", "actions", "overflow", "contextual"],
};
