"use client";

import { useState } from "react";
import { FileTree, type FileTreeNode } from "@hex-core/components";

const projectFiles: FileTreeNode[] = [
	{
		id: "src",
		name: "src",
		children: [
			{ id: "src/index.tsx", name: "index.tsx" },
			{
				id: "src/components",
				name: "components",
				children: [
					{ id: "src/components/Button.tsx", name: "Button.tsx" },
					{ id: "src/components/Input.tsx", name: "Input.tsx" },
					{
						id: "src/components/multi-combobox",
						name: "multi-combobox",
						children: [
							{
								id: "src/components/multi-combobox/multi-combobox.tsx",
								name: "multi-combobox.tsx",
							},
							{
								id: "src/components/multi-combobox/multi-combobox.schema.ts",
								name: "multi-combobox.schema.ts",
							},
						],
					},
				],
			},
			{ id: "src/legacy", name: "legacy", disabled: true },
		],
	},
	{ id: "package.json", name: "package.json" },
	{ id: "README.md", name: "README.md" },
];

/**
 * FileTree demo: a project-tree explorer with a couple of folders pre-expanded
 * and a disabled `legacy` folder to show the dimmed state.
 */
export function FileTreeDemo() {
	const [selected, setSelected] = useState<string>();

	return (
		<div className="max-w-sm">
			<p className="mb-2 text-xs font-medium text-muted-foreground">
				Project files
			</p>
			<div className="rounded-md border bg-card p-[var(--space-2,0.5rem)]">
				<FileTree
					aria-label="Project files"
					nodes={projectFiles}
					defaultExpanded={["src", "src/components"]}
					selected={selected}
					onSelect={setSelected}
				/>
			</div>
			{selected ? (
				<p className="mt-2 text-xs text-muted-foreground">
					Selected: <code>{selected}</code>
				</p>
			) : null}
		</div>
	);
}
