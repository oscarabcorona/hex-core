import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const fileTreeSchema: ComponentSchemaDefinition = {
	name: "file-tree",
	displayName: "File Tree",
	description:
		"Hierarchical tree view for files, folders, and any nested navigation. Implements the WAI-ARIA tree pattern with role='tree' / 'treeitem' / 'group', aria-level, aria-expanded, aria-selected, and full keyboard navigation (Up/Down/Left/Right/Home/End/Enter/Space).",
	category: "component",
	subcategory: "navigation",
	props: [
		{
			name: "nodes",
			type: "object",
			required: true,
			description:
				"Tree of { id, name, children?, icon?, disabled? }. Presence of `children` (even an empty array) marks the node as a folder.",
		},
		{
			name: "defaultExpanded",
			type: "object",
			required: false,
			description: "Uncontrolled — initial expanded ids (string[]).",
		},
		{
			name: "expanded",
			type: "object",
			required: false,
			description: "Controlled expanded ids (string[]). Pair with onExpandedChange.",
		},
		{
			name: "onExpandedChange",
			type: "function",
			required: false,
			description: "Fired with the new expanded ids: (ids: string[]) => void",
		},
		{
			name: "selected",
			type: "string",
			required: false,
			description: "Controlled selected node id.",
		},
		{
			name: "onSelect",
			type: "function",
			required: false,
			description:
				"Fired when the user activates a node via click, Enter, or Space: (id: string) => void",
		},
		{
			name: "aria-label",
			type: "string",
			required: true,
			description:
				"Required accessible name for the tree (e.g. 'File explorer', 'Settings sections').",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"accent",
		"accent-foreground",
		"muted-foreground",
		"ring",
	],
	examples: [
		{
			title: "Basic file tree",
			description: "Uncontrolled expanded set; selected state controlled",
			code: 'import { useState } from "react";\nimport { FileTree } from "@/components/ui/file-tree";\n\nconst nodes = [\n  {\n    id: "src",\n    name: "src",\n    children: [\n      { id: "src/index.tsx", name: "index.tsx" },\n      {\n        id: "src/components",\n        name: "components",\n        children: [\n          { id: "src/components/Button.tsx", name: "Button.tsx" },\n          { id: "src/components/Input.tsx", name: "Input.tsx" },\n        ],\n      },\n    ],\n  },\n  { id: "package.json", name: "package.json" },\n];\n\nexport function Example() {\n  const [selected, setSelected] = useState<string>();\n  return (\n    <FileTree\n      aria-label="Project files"\n      nodes={nodes}\n      defaultExpanded={["src"]}\n      selected={selected}\n      onSelect={setSelected}\n    />\n  );\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for hierarchical navigation: file/folder explorers, settings sections, org charts, taxonomy browsers. Renders a real ARIA tree with full keyboard support, so it works for sighted, keyboard, and screen-reader users.",
		whenNotToUse:
			"Don't use for flat lists (use ScrollArea + a list). Don't use for navigation menus (use NavigationMenu). Don't use for very deep trees (>5 levels) without virtualization — every node is rendered. Don't use for selecting multiple files concurrently — multi-select tree UX is a different beast; ship a separate component when you need it.",
		commonMistakes: [
			"Mixing controlled `expanded` with `defaultExpanded` — pass exactly one",
			"Using non-stable node ids (e.g. array index) — collapsing/expanding shifts state",
			"Marking a leaf with `children: []` instead of omitting `children` — empty array still flags it as a folder, so the chevron shows",
			"Forgetting aria-label — the tree gets no accessible name and screen readers announce just 'tree'",
			"Calling onSelect to navigate without de-bouncing arrow-key focus changes — focus moves on arrows but does NOT call onSelect; only Enter/Space/click selects, so navigation should hang off onSelect, not focused state",
			"Expecting row-click to toggle expand — per WAI-ARIA tree pattern the row click only selects; toggling is the chevron button (or ArrowRight/Left, or Enter/Space when the row is focused). Common surprise after coming from VS Code-style trees",
			"Passing `selected` pointing at a node inside a collapsed branch — the tree falls back to the first visible node for tab focus, so the consumer can't rely on tabIndex to land on the selected target until it's revealed via expanded",
		],
		relatedComponents: ["accordion", "navigation-menu", "sidebar"],
		accessibilityNotes:
			"Root: role='tree' with aria-label. Each node: role='treeitem' with aria-level, aria-expanded (folders only), aria-selected, tabIndex=0 only on the active visible node (roving tabindex). Children container: role='group'. Click semantics: row click selects only; the chevron is a separate decorative button that toggles. Keyboard: ArrowDown/Up move through visible non-disabled nodes (disabled nodes are skipped); ArrowRight expands a closed folder or moves to first child; ArrowLeft collapses an open folder or moves to parent; Home/End jump to first/last visible; Enter/Space activate (toggle on folders, select on all).",
		tokenBudget: 1295,
	},
	tags: ["file-tree", "tree", "navigation", "explorer", "hierarchy"],
};
