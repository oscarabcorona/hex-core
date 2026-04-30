import { Tree, type TreeNode } from "../../components/ui";

const ORG: TreeNode[] = [
	{
		id: "ceo",
		label: "CEO",
		children: [
			{
				id: "cto",
				label: "CTO",
				children: [
					{ id: "eng-lead", label: "Eng Lead" },
					{ id: "infra-lead", label: "Infra Lead" },
				],
			},
			{ id: "cmo", label: "CMO" },
			{ id: "cfo", label: "CFO" },
		],
	},
];

export function TreeDemo() {
	return (
		<div className="w-full max-w-md">
			<Tree aria-label="Org chart" data={ORG} defaultExpanded={["ceo", "cto"]} />
		</div>
	);
}
