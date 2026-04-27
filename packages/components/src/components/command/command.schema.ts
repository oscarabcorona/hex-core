import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const commandSchema: ComponentSchemaDefinition = {
	name: "command",
	displayName: "Command",
	description:
		"Composable command menu built on cmdk — search input + filtered list with keyboard navigation. Use as an inline palette or, wrapped in CommandDialog, as a ⌘K-style launcher.",
	category: "component",
	subcategory: "overlay",
	props: [
		{
			name: "shouldFilter",
			type: "boolean",
			required: false,
			default: true,
			description: "Built-in filtering. Set to false for fully-controlled filtering.",
		},
		{
			name: "filter",
			type: "function",
			required: false,
			description: "Custom scoring function: (value, search, keywords?) => number (0..1)",
		},
		{
			name: "value",
			type: "string",
			required: false,
			description: "Controlled active-item value",
		},
		{
			name: "onValueChange",
			type: "function",
			required: false,
			description: "Callback when the highlighted item changes",
		},
		{
			name: "loop",
			type: "boolean",
			required: false,
			default: false,
			description: "Loop arrow-key navigation at the ends of the list",
		},
		{
			name: "label",
			type: "string",
			required: false,
			description: "Accessible label for the menu (not shown visually)",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description: "CommandInput + CommandList with CommandEmpty, CommandGroup, CommandItem, CommandSeparator",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["cmdk", "@radix-ui/react-dialog", "clsx", "tailwind-merge"],
		internal: ["components/dialog/dialog", "lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["popover", "popover-foreground", "accent", "accent-foreground", "border", "muted-foreground"],
	examples: [
		{
			title: "Command dialog launcher (⌘K)",
			description: "Toggle a command palette with keyboard shortcut",
			code: 'import { useEffect, useState } from "react";\nimport { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";\n\nexport function Example() {\n  const [open, setOpen] = useState(false);\n  useEffect(() => {\n    const down = (e: KeyboardEvent) => {\n      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {\n        e.preventDefault();\n        setOpen(v => !v);\n      }\n    };\n    document.addEventListener("keydown", down);\n    return () => document.removeEventListener("keydown", down);\n  }, []);\n  return (\n    <CommandDialog open={open} onOpenChange={setOpen}>\n      <CommandInput placeholder="Type a command or search…" />\n      <CommandList>\n        <CommandEmpty>No results found.</CommandEmpty>\n        <CommandGroup heading="Suggestions">\n          <CommandItem onSelect={() => setOpen(false)}>Profile</CommandItem>\n          <CommandItem onSelect={() => setOpen(false)}>Settings</CommandItem>\n        </CommandGroup>\n      </CommandList>\n    </CommandDialog>\n  );\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for searchable menus, command palettes, ⌘K launchers, or as the list body of a Combobox. Built-in fuzzy filter + arrow-key nav + Enter-to-select.",
		whenNotToUse:
			"Don't use for small static lists (use plain DropdownMenu). Don't use for large data tables (use DataTable). If you need a select input with a single bound value, Combobox is the higher-level wrapper.",
		commonMistakes: [
			"Forgetting CommandList — items won't be scrollable or grouped properly",
			"Giving CommandItem non-unique values (breaks filtering and controlled state)",
			"Overriding CommandInput className to remove the border/padding — breaks the ⌘K icon layout",
			"Not rendering CommandEmpty — the list looks broken when a search has no matches",
			"Querying CommandSeparator via cmdk's internal Separator state — Hex UI renders it as a presentational div with role='none' (and the `data-cmdk-separator` attribute preserved for selector compatibility) so it can sit inside CommandList's role=listbox without violating ARIA",
		],
		relatedComponents: ["combobox", "dialog", "dropdown-menu"],
		accessibilityNotes:
			"cmdk wires role=listbox/option and aria-activedescendant. Use the `label` prop on Command for a screen-reader-only name when no visible heading exists. CommandSeparator renders with role='none' (still selectable via `[data-cmdk-separator]`) so listbox-children rules are satisfied.",
		tokenBudget: 900,
	},
	tags: ["command", "cmdk", "palette", "search", "launcher"],
};
