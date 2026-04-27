import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileTree, type FileTreeNode } from "./file-tree.js";

const nodes: FileTreeNode[] = [
	{
		id: "src",
		name: "src",
		children: [
			{ id: "src/index.tsx", name: "index.tsx" },
			{
				id: "src/components",
				name: "components",
				children: [{ id: "src/components/Button.tsx", name: "Button.tsx" }],
			},
		],
	},
	{ id: "pkg", name: "package.json" },
];

describe("FileTree", () => {
	it("renders role='tree' with the provided aria-label", () => {
		render(<FileTree aria-label="Files" nodes={nodes} />);
		expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument();
	});

	it("only renders top-level treeitems by default; folders advertise aria-expanded='false'", () => {
		render(<FileTree aria-label="Files" nodes={nodes} />);
		const items = screen.getAllByRole("treeitem");
		expect(items).toHaveLength(2); // src + pkg
		const src = items[0];
		expect(src).toHaveAttribute("aria-expanded", "false");
		expect(src).toHaveAttribute("aria-level", "1");
	});

	it("defaultExpanded reveals child treeitems with the correct aria-level", () => {
		render(
			<FileTree
				aria-label="Files"
				nodes={nodes}
				defaultExpanded={["src"]}
			/>,
		);
		const items = screen.getAllByRole("treeitem");
		// src + index + components + pkg
		expect(items).toHaveLength(4);
		const indexFile = screen.getByText("index.tsx").closest('[role="treeitem"]');
		expect(indexFile).toHaveAttribute("aria-level", "2");
	});

	it("clicking the chevron toggles aria-expanded; clicking the row only selects (WAI-ARIA tree pattern)", async () => {
		const handleSelect = vi.fn();
		render(
			<FileTree aria-label="Files" nodes={nodes} onSelect={handleSelect} />,
		);
		const src = screen.getByText("src").closest('[role="treeitem"]') as HTMLElement;
		expect(src).toHaveAttribute("aria-expanded", "false");

		// Row click does NOT toggle — only selects
		await userEvent.click(src);
		expect(src).toHaveAttribute("aria-expanded", "false");
		expect(handleSelect).toHaveBeenLastCalledWith("src");

		// Chevron click toggles, does NOT change selection
		const chevron = src.querySelector("button") as HTMLElement;
		expect(chevron).not.toBeNull();
		await userEvent.click(chevron);
		expect(src).toHaveAttribute("aria-expanded", "true");
	});

	it("clicking a leaf row fires onSelect with the node id", async () => {
		const handleSelect = vi.fn();
		render(
			<FileTree
				aria-label="Files"
				nodes={nodes}
				defaultExpanded={["src"]}
				onSelect={handleSelect}
			/>,
		);
		const indexFile = screen.getByText("index.tsx").closest('[role="treeitem"]') as HTMLElement;
		await userEvent.click(indexFile);
		expect(handleSelect).toHaveBeenCalledWith("src/index.tsx");
	});

	it("ArrowRight on a closed folder expands it; ArrowLeft on an open folder collapses it", async () => {
		render(<FileTree aria-label="Files" nodes={nodes} />);
		const src = screen.getByText("src").closest('[role="treeitem"]') as HTMLElement;
		src.focus();
		await userEvent.keyboard("{ArrowRight}");
		expect(src).toHaveAttribute("aria-expanded", "true");

		await userEvent.keyboard("{ArrowLeft}");
		expect(src).toHaveAttribute("aria-expanded", "false");
	});

	it("Enter on a leaf node fires onSelect with the node id", async () => {
		const handle = vi.fn();
		render(
			<FileTree
				aria-label="Files"
				nodes={nodes}
				defaultExpanded={["src"]}
				onSelect={handle}
			/>,
		);
		const indexFile = screen.getByText("index.tsx").closest('[role="treeitem"]') as HTMLElement;
		indexFile.focus();
		await userEvent.keyboard("{Enter}");
		expect(handle).toHaveBeenCalledWith("src/index.tsx");
	});

	it("disabled nodes carry aria-disabled='true' and ignore clicks", async () => {
		const handle = vi.fn();
		render(
			<FileTree
				aria-label="Files"
				nodes={[
					{ id: "a", name: "Active" },
					{ id: "b", name: "Disabled", disabled: true },
				]}
				onSelect={handle}
			/>,
		);
		const dis = screen.getByText("Disabled").closest('[role="treeitem"]') as HTMLElement;
		expect(dis).toHaveAttribute("aria-disabled", "true");
		await userEvent.click(dis);
		expect(handle).not.toHaveBeenCalled();
	});

	it("uses roving tabindex — only one treeitem has tabindex=0 at a time", () => {
		render(
			<FileTree
				aria-label="Files"
				nodes={nodes}
				defaultExpanded={["src"]}
			/>,
		);
		const tabbables = screen
			.getAllByRole("treeitem")
			.filter((el) => el.getAttribute("tabindex") === "0");
		expect(tabbables).toHaveLength(1);
	});

	it("when `selected` lives inside a collapsed branch, the tree still has exactly one tabbable item (falls back to the first visible)", () => {
		render(
			<FileTree
				aria-label="Files"
				nodes={nodes}
				selected="src/components/Button.tsx"
			/>,
		);
		// `src` is collapsed so Button.tsx isn't rendered; tabbable should land on `src` (first visible)
		const tabbables = screen
			.getAllByRole("treeitem")
			.filter((el) => el.getAttribute("tabindex") === "0");
		expect(tabbables).toHaveLength(1);
		expect(tabbables[0]).toHaveTextContent("src");
	});

	it("Home jumps to the first visible item; End jumps to the last", async () => {
		render(
			<FileTree
				aria-label="Files"
				nodes={nodes}
				defaultExpanded={["src", "src/components"]}
			/>,
		);
		const items = screen.getAllByRole("treeitem");
		const second = items[1];
		second.focus();
		await userEvent.keyboard("{End}");
		// Last visible item is "package.json"
		const last = items[items.length - 1];
		expect(last).toHaveAttribute("tabindex", "0");
		await userEvent.keyboard("{Home}");
		expect(items[0]).toHaveAttribute("tabindex", "0");
	});
});
