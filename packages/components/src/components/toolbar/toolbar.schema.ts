import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const toolbarSchema: ComponentSchemaDefinition = {
	name: "toolbar",
	displayName: "Toolbar",
	description:
		"A horizontal or vertical group of related controls (buttons, toggles, links, separators) with arrow-key roving focus. Wraps Radix Toolbar so the keyboard semantics are correct out of the box.",
	category: "component",
	subcategory: "navigation",
	props: [
		{
			name: "orientation",
			type: "enum",
			required: false,
			default: "horizontal",
			description: "Layout direction. Drives arrow-key behavior — ←→ for horizontal, ↑↓ for vertical.",
			enumValues: ["horizontal", "vertical"],
		},
		{
			name: "aria-label",
			type: "string",
			required: true,
			description: "Accessible name for the toolbar landmark. Toolbar mounts as a role='toolbar' region — without a name, AT users hear an unlabelled landmark. If a visible heading sits adjacent, you may pair via aria-labelledby instead (which still satisfies this requirement).",
		},
	],
	variants: [
		{
			name: "orientation",
			description: "Layout direction.",
			values: [
				{
					value: "horizontal",
					description: "Default — controls flow left-to-right.",
					useWhen: "the toolbar sits at the top or bottom of a panel / editor",
				},
				{
					value: "vertical",
					description: "Controls flow top-to-bottom.",
					useWhen: "the toolbar runs alongside a canvas / editor as a side rail",
				},
			],
			default: "horizontal",
		},
	],
	slots: [
		{
			name: "children",
			description: "Mix of ToolbarButton / ToolbarToggleGroup / ToolbarToggleItem / ToolbarLink / ToolbarSeparator.",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-toolbar", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "border", "foreground", "accent", "accent-foreground", "ring"],
	examples: [
		{
			title: "Editor toolbar with toggle group",
			description: "Undo + Redo + Separator + alignment toggles",
			code: '<Toolbar aria-label="Editor controls">\n  <ToolbarButton onClick={onUndo}>Undo</ToolbarButton>\n  <ToolbarButton onClick={onRedo}>Redo</ToolbarButton>\n  <ToolbarSeparator />\n  <ToolbarToggleGroup type="single" defaultValue="left">\n    <ToolbarToggleItem value="left">Left</ToolbarToggleItem>\n    <ToolbarToggleItem value="center">Center</ToolbarToggleItem>\n    <ToolbarToggleItem value="right">Right</ToolbarToggleItem>\n  </ToolbarToggleGroup>\n</Toolbar>',
			composition: ["toolbar", "editor", "toggle-group"],
		},
		{
			title: "Side-rail vertical toolbar",
			description: "Vertical toolbar alongside a canvas",
			code: '<Toolbar orientation="vertical" aria-label="Drawing tools">\n  <ToolbarToggleGroup type="single" defaultValue="select">\n    <ToolbarToggleItem value="select"><CursorIcon /></ToolbarToggleItem>\n    <ToolbarToggleItem value="pen"><PenIcon /></ToolbarToggleItem>\n    <ToolbarToggleItem value="eraser"><EraserIcon /></ToolbarToggleItem>\n  </ToolbarToggleGroup>\n  <ToolbarSeparator />\n  <ToolbarButton aria-label="Settings"><SettingsIcon /></ToolbarButton>\n</Toolbar>',
			composition: ["toolbar", "vertical", "canvas", "icon-only"],
		},
	],
	ai: {
		whenToUse:
			"Use to group related controls that operate on a single content area (editor, canvas, table). The roving-tabindex behavior means Tab enters the toolbar at the first item, then arrow keys navigate within — preserves the surrounding page's tab order.",
		whenNotToUse:
			"Don't use for app-level menus (use Menubar). Don't use for a single mutually-exclusive selection (use ToggleGroup directly — Toolbar is for groupING ToggleGroups + Buttons + Links). Don't use for navigation (use NavigationMenu).",
		commonMistakes: [
			"Forgetting aria-label when the toolbar isn't adjacent to a visible heading",
			"Mixing controls that operate on different content areas — Toolbar implies a single target",
			"Using Toolbar inside a Toolbar — nest a vertical Toolbar inside a horizontal one if you really need a 2D grid, but consider whether a single Toolbar with Separators is clearer",
		],
		antiPatterns: [
			{
				mistake: "Using Toolbar for a single-axis mutually-exclusive selection (alignment, list-style)",
				insteadUse: "toggle-group",
				why: "Toolbar is the multi-control container. ToggleGroup directly gives you 'pick one of N' with proper keyboard semantics — adding a Toolbar wrapper just costs DOM.",
			},
			{
				mistake: "Using Toolbar for an application top-level menu (File, Edit, View, …)",
				insteadUse: "menubar",
				why: "Menubar models nested menus with proper open-on-focus semantics. Toolbar is for flat command groups; the menu pattern needs Menubar.",
			},
			{
				mistake: "Using Toolbar for primary site / app navigation",
				insteadUse: "navigation-menu",
				why: "NavigationMenu ships landmark role + skip links + the right ARIA attributes for primary nav. Toolbar is for content-region controls, not page-level routing.",
			},
		],
		relatedComponents: ["toggle", "toggle-group", "menubar", "navigation-menu", "separator"],
		accessibilityNotes:
			"Radix wires role='toolbar', roving tabindex (Tab enters at the first focusable item, arrows move within), Home/End jump to first/last. Always pass aria-label when there's no visible heading next to the toolbar.",
		tokenBudget: 600,
	},
	tags: ["toolbar", "editor", "controls", "command-group"],
};
