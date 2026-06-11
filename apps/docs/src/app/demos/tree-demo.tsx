"use client";

import { useState } from "react";
import { Button, Tree, type TreeNode } from "../../components/ui";

const INITIAL: TreeNode[] = [
	{
		id: "engineering",
		label: "Engineering",
		children: [
			{ id: "eng-lead", label: "Eng Lead" },
			{ id: "infra-lead", label: "Infra Lead" },
		],
	},
	{
		id: "marketing",
		label: "Marketing",
		children: [{ id: "growth", label: "Growth" }],
	},
	{
		id: "finance",
		label: "Finance",
		children: [{ id: "cfo", label: "CFO" }],
	},
];

export function TreeDemo() {
	const [data, setData] = useState(INITIAL);
	const [reorder, setReorder] = useState(false);

	return (
		<div className="w-full max-w-md space-y-3">
			<div className="flex items-center justify-between">
				<p className="text-xs text-muted-foreground">
					{reorder
						? "Drag the handle on a top-level row to reorder."
						: "Toggle reorder to enable top-level drag handles."}
				</p>
				<Button variant="outline" size="sm" onClick={() => setReorder((v) => !v)}>
					{reorder ? "Disable reorder" : "Enable reorder"}
				</Button>
			</div>
			<Tree
				aria-label="Org chart"
				data={data}
				defaultExpanded={["engineering"]}
				reorderable={reorder}
				onNodeReorder={setData}
			/>
		</div>
	);
}
