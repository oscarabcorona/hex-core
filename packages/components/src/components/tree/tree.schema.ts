import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const treeSchema: ComponentSchemaDefinition = {
	name: "tree",
	displayName: "Tree",
	description:
		"Generic hierarchical list with roving-tabindex keyboard navigation. Distinct from FileTree (which adds folder/file icon-by-extension logic) — Tree is content-agnostic for org charts, taxonomy pickers, navigation trees.",
	category: "component",
	subcategory: "navigation",
	props: [
		{ name: "data", type: "object", required: true, description: "Root nodes (TreeNode[])." },
		{ name: "defaultExpanded", type: "object", required: false, description: "Initial expanded ids (uncontrolled). string[]." },
		{ name: "expanded", type: "object", required: false, description: "Controlled expanded ids. string[]." },
		{ name: "onExpandedChange", type: "function", required: false, description: "Callback (ids: string[]) => void." },
		{ name: "selected", type: "string", required: false, description: "Controlled selected node id." },
		{ name: "onSelect", type: "function", required: false, description: "Callback (id: string) => void on activation." },
		{ name: "aria-label", type: "string", required: true, description: "Accessible name for the tree landmark." },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "accent", "accent-foreground", "ring"],
	examples: [
		{
			title: "Org chart",
			description: "Hierarchical staff tree with expand/select",
			code: '<Tree\n  aria-label="Org chart"\n  data={[\n    { id: "ceo", label: "CEO", children: [\n      { id: "cto", label: "CTO", children: [{ id: "eng-lead", label: "Eng Lead" }] },\n      { id: "cmo", label: "CMO" },\n    ]},\n  ]}\n  defaultExpanded={["ceo"]}\n  onSelect={(id) => console.log(id)}\n/>',
			composition: ["tree", "navigation", "hierarchy"],
		},
		{
			title: "Taxonomy picker",
			description: "Categorize a record by picking a leaf in a 3-level taxonomy",
			code: '<Tree\n  aria-label="Category"\n  data={taxonomy}\n  selected={category}\n  onSelect={setCategory}\n/>',
			composition: ["tree", "form", "picker"],
		},
	],
	ai: {
		whenToUse:
			"Use for hierarchical data the user navigates by keyboard or click — org charts, taxonomy pickers, generic nav trees. Pair with selected + onSelect for picker semantics; pair with onExpandedChange to control expansion externally.",
		whenNotToUse:
			"Don't use for filesystem-shaped data — FileTree adds folder/file icon-by-extension. Don't use for two-level groupings without item-selection — Accordion is the cleaner abstraction. Don't use for primary site nav (NavigationMenu).",
		commonMistakes: [
			"Forgetting aria-label — required, no fallback",
			"Confusing data prop (TreeNode[]) with FileTree's nodes prop (FileTreeNode[]) — same shape but different icon defaults",
			"Trying to pass selected without onSelect — controlled-mode without an updater leaves it stuck",
		],
		antiPatterns: [
			{
				mistake: "Using Tree for filesystem-shaped data (folders + files with icon-by-extension)",
				insteadUse: "file-tree",
				why: "FileTree ships file/folder icon defaults + extension-based color hints. Tree is icon-agnostic — using it for files means hand-wiring icon logic each time.",
			},
			{
				mistake: "Using Tree for a two-level grouping (sections that expand to reveal content) without item-selection",
				insteadUse: "accordion",
				why: "Accordion is purpose-built for collapse-content-into-sections. Tree's role='tree' implies item-selection semantics that don't fit pure expand/collapse content groups.",
			},
			{
				mistake: "Using Tree for primary site / app navigation",
				insteadUse: "navigation-menu",
				why: "NavigationMenu ships landmark role + skip links + the right ARIA for primary nav. Tree's tree role is for data, not routing.",
			},
		],
		relatedComponents: ["file-tree", "accordion", "navigation-menu"],
		accessibilityNotes:
			"role='tree' on root, role='treeitem' per row, aria-expanded on parents, aria-selected on the chosen leaf. Keyboard: ↑↓ move focus, → expand (or jump to first child if expanded), ← collapse (or jump to parent), Home/End first/last visible row, Enter/Space activate.",
		tokenBudget: 1141,
	},
	tags: ["tree", "hierarchy", "navigation", "picker", "ARIA-tree"],
};
