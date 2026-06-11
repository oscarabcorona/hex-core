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

describe("Tree reorder (top-level only)", () => {
	const flat: TreeNode[] = [
		{ id: "a", label: "A" },
		{ id: "b", label: "B" },
		{ id: "c", label: "C" },
	];

	it("renders unchanged when reorderable is false (default)", () => {
		render(<Tree aria-label="Test" data={flat} />);
		expect(screen.queryByRole("button", { name: /Drag to reorder/ })).toBeNull();
		expect(document.querySelector("[data-row-id]")).toBeNull();
	});

	it("renders a drag-handle button on each ROOT row only when reorderable is true", () => {
		render(<Tree aria-label="Test" data={TREE} reorderable defaultExpanded={["ceo"]} />);
		const handles = screen.getAllByRole("button", { name: /Drag to reorder/ });
		// Only 1 root in TREE → only 1 handle, even though CTO/CMO are visible.
		expect(handles).toHaveLength(1);
	});

	it("each root row exposes data-row-id matching the node id", () => {
		render(<Tree aria-label="Test" data={flat} reorderable />);
		expect(document.querySelector('[data-row-id="a"]')).not.toBeNull();
		expect(document.querySelector('[data-row-id="b"]')).not.toBeNull();
		expect(document.querySelector('[data-row-id="c"]')).not.toBeNull();
	});

	it("each sortable row carries data-dragging=false in static state", () => {
		render(<Tree aria-label="Test" data={flat} reorderable />);
		document.querySelectorAll("[data-row-id]").forEach((row) => {
			expect(row.getAttribute("data-dragging")).toBe("false");
		});
	});

	it("clicking the drag handle does NOT trigger row activation (stopPropagation)", async () => {
		const onSelect = vi.fn();
		render(<Tree aria-label="Test" data={flat} reorderable onSelect={onSelect} />);
		await userEvent.click(screen.getAllByRole("button", { name: /Drag to reorder/ })[0]);
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("existing keyboard navigation still works when reorderable is enabled (ArrowDown shifts roving tabIndex from A to B)", async () => {
		const user = userEvent.setup();
		render(<Tree aria-label="Test" data={flat} reorderable />);
		const a = screen.getByRole("treeitem", { name: "A" });
		const b = screen.getByRole("treeitem", { name: "B" });
		// Initially A is the active row (first visible).
		expect(a).toHaveAttribute("tabindex", "0");
		expect(b).toHaveAttribute("tabindex", "-1");
		a.focus();
		await user.keyboard("{ArrowDown}");
		// After ArrowDown, the roving tabindex hops to B (Tree's existing model).
		expect(a).toHaveAttribute("tabindex", "-1");
		expect(b).toHaveAttribute("tabindex", "0");
	});
});
