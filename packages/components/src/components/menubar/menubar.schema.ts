import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const menubarSchema: ComponentSchemaDefinition = {
	name: "menubar",
	displayName: "Menubar",
	description: "Desktop-app style menu bar (File / Edit / View). Horizontal menu strip with nested dropdowns.",
	category: "component",
	subcategory: "navigation",
	props: [
		{ name: "value", type: "string", required: false, description: "Controlled open menu id" },
		{ name: "defaultValue", type: "string", required: false, description: "Default open menu for uncontrolled usage" },
		{ name: "onValueChange", type: "function", required: false, description: "Callback when open menu changes" },
		{ name: "loop", type: "boolean", required: false, default: true, description: "When true, arrow-key navigation wraps" },
		{ name: "dir", type: "enum", required: false, description: "Reading direction", enumValues: ["ltr", "rtl"] },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes on the Menubar root" },
	],
	variants: [],
	slots: [
		{ name: "children", description: "MenubarMenu elements (each containing MenubarTrigger + MenubarContent)", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@radix-ui/react-menubar", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "popover", "popover-foreground", "accent", "accent-foreground", "muted", "muted-foreground"],
	examples: [
		{
			title: "File / Edit bar",
			description: "Two-menu bar with keyboard shortcuts",
			code: '<Menubar>\n  <MenubarMenu>\n    <MenubarTrigger>File</MenubarTrigger>\n    <MenubarContent>\n      <MenubarItem>New Tab<MenubarShortcut>\u2318T</MenubarShortcut></MenubarItem>\n      <MenubarItem>New Window<MenubarShortcut>\u2318N</MenubarShortcut></MenubarItem>\n      <MenubarSeparator />\n      <MenubarItem>Share</MenubarItem>\n      <MenubarSeparator />\n      <MenubarItem>Print\u2026<MenubarShortcut>\u2318P</MenubarShortcut></MenubarItem>\n    </MenubarContent>\n  </MenubarMenu>\n  <MenubarMenu>\n    <MenubarTrigger>Edit</MenubarTrigger>\n    <MenubarContent>\n      <MenubarItem>Undo<MenubarShortcut>\u2318Z</MenubarShortcut></MenubarItem>\n      <MenubarItem>Redo<MenubarShortcut>\u21E7\u2318Z</MenubarShortcut></MenubarItem>\n    </MenubarContent>\n  </MenubarMenu>\n</Menubar>',
		},
	],
	ai: {
		whenToUse:
			"Use for desktop-app shell menus: editors, IDEs, creative tools. Provides persistent menu bar with keyboard shortcuts.",
		whenNotToUse:
			"Don't use for website navigation (use NavigationMenu). Don't use for single-button menus (use DropdownMenu). Poor fit for mobile — consider a hamburger menu.",
		commonMistakes: [
			"Using for website navigation (user expectations don't match)",
			"Missing shortcuts (expected affordance in menubar UX)",
			"Deeply nested sub-menus (>2 levels feels labyrinthine)",
		],
		relatedComponents: ["navigation-menu", "dropdown-menu"],
		accessibilityNotes:
			"Full WAI-ARIA menubar pattern: arrow keys navigate menus, Enter/Space opens, Escape closes. Radix handles roles and state.",
		tokenBudget: 831,
	},
	tags: ["menubar", "menu", "desktop", "app-shell", "navigation"],
};
