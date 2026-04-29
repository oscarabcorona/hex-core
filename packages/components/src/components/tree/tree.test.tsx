import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tree, type TreeNode } from "./tree.js";

const TREE: TreeNode[] = [
	{
		id: "ceo",
		label: "CEO",
		children: [
			{ id: "cto", label: "CTO", children: [{ id: "eng", label: "Eng Lead" }] },
			{ id: "cmo", label: "CMO" },
		],
	},
];

describe("Tree", () => {
	it("renders the root nodes only when nothing is expanded", () => {
		render(<Tree aria-label="Org" data={TREE} />);
		expect(screen.getByRole("treeitem", { name: /CEO/ })).toBeInTheDocument();
		expect(screen.queryByRole("treeitem", { name: /CTO/ })).not.toBeInTheDocument();
	});

	it("expands children when defaultExpanded includes the parent id", () => {
		render(<Tree aria-label="Org" data={TREE} defaultExpanded={["ceo"]} />);
		expect(screen.getByRole("treeitem", { name: /CTO/ })).toBeInTheDocument();
		// CTO's children stay hidden until CTO itself expands.
		expect(screen.queryByRole("treeitem", { name: /Eng Lead/ })).not.toBeInTheDocument();
	});

	it("toggles expansion on click", async () => {
		render(<Tree aria-label="Org" data={TREE} />);
		await userEvent.click(screen.getByRole("treeitem", { name: /CEO/ }));
		expect(screen.getByRole("treeitem", { name: /CTO/ })).toBeInTheDocument();
	});

	it("calls onSelect with the activated node id", async () => {
		const onSelect = vi.fn();
		render(<Tree aria-label="Org" data={TREE} onSelect={onSelect} />);
		await userEvent.click(screen.getByRole("treeitem", { name: /CEO/ }));
		expect(onSelect).toHaveBeenCalledWith("ceo");
	});

	it("sets aria-selected on the controlled-selected node", () => {
		render(
			<Tree aria-label="Org" data={TREE} defaultExpanded={["ceo"]} selected="cmo" onSelect={() => {}} />,
		);
		expect(screen.getByRole("treeitem", { name: /CMO/ })).toHaveAttribute("aria-selected", "true");
	});

	it("respects aria-disabled", () => {
		const data: TreeNode[] = [
			{ id: "a", label: "A", disabled: true },
			{ id: "b", label: "B" },
		];
		render(<Tree aria-label="Test" data={data} />);
		expect(screen.getByRole("treeitem", { name: "A" })).toHaveAttribute("aria-disabled", "true");
		expect(screen.getByRole("treeitem", { name: "B" })).not.toHaveAttribute("aria-disabled");
	});
});
