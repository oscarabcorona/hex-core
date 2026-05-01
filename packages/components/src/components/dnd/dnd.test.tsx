import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DndProvider, SortableList, arrayMove, useSortableItem } from "./dnd.js";

function SortableItem({ id, label }: { id: string; label: string }) {
	const { setNodeRef, attributes, listeners, style, isDragging } = useSortableItem(id);
	return (
		<div
			ref={setNodeRef}
			style={style}
			data-testid={`item-${id}`}
			data-dragging={isDragging}
			{...attributes}
			{...listeners}
		>
			{label}
		</div>
	);
}

describe("SortableList", () => {
	it("renders all items in the order supplied", () => {
		const items = [
			{ id: "a", label: "Alpha" },
			{ id: "b", label: "Bravo" },
			{ id: "c", label: "Charlie" },
		];
		render(
			<SortableList
				items={items}
				onChange={() => {}}
				renderItem={(item) => <SortableItem id={item.id} label={item.label} />}
			/>,
		);
		const list = screen.getByText("Alpha").closest("[data-hex-sortable-list]");
		expect(list).not.toBeNull();
		const rendered = Array.from(list!.querySelectorAll("[data-testid^='item-']")).map(
			(el) => el.textContent,
		);
		expect(rendered).toEqual(["Alpha", "Bravo", "Charlie"]);
	});

	it("forwards the strategy as a data attribute", () => {
		render(
			<SortableList
				items={[{ id: "a", label: "A" }]}
				onChange={() => {}}
				renderItem={(item) => <SortableItem id={item.id} label={item.label} />}
				strategy="horizontal"
			/>,
		);
		const list = screen.getByText("A").closest("[data-hex-sortable-list]");
		expect(list).toHaveAttribute("data-strategy", "horizontal");
	});

	it("merges className", () => {
		render(
			<SortableList
				items={[{ id: "a", label: "A" }]}
				onChange={() => {}}
				renderItem={(item) => <SortableItem id={item.id} label={item.label} />}
				className="custom-list-class"
			/>,
		);
		const list = screen.getByText("A").closest("[data-hex-sortable-list]");
		expect(list?.className).toContain("custom-list-class");
	});

	it("uses flex-col layout for vertical strategy and flex (row) for horizontal", () => {
		const { rerender } = render(
			<SortableList
				items={[{ id: "a", label: "A" }]}
				onChange={() => {}}
				renderItem={(item) => <SortableItem id={item.id} label={item.label} />}
				strategy="vertical"
			/>,
		);
		expect(screen.getByText("A").parentElement?.className).toContain("flex-col");

		rerender(
			<SortableList
				items={[{ id: "a", label: "A" }]}
				onChange={() => {}}
				renderItem={(item) => <SortableItem id={item.id} label={item.label} />}
				strategy="horizontal"
			/>,
		);
		const horizontalParent = screen.getByText("A").parentElement;
		expect(horizontalParent?.className).toContain("flex");
		expect(horizontalParent?.className).not.toContain("flex-col");
	});
});

describe("useSortableItem", () => {
	it("returns refs/attributes/listeners/style without throwing inside a SortableContext", () => {
		// Indirect: rendering a SortableList that uses the hook must not crash.
		expect(() =>
			render(
				<SortableList
					items={[{ id: "x", label: "X" }]}
					onChange={() => {}}
					renderItem={(item) => <SortableItem id={item.id} label={item.label} />}
				/>,
			),
		).not.toThrow();
		const item = screen.getByTestId("item-x");
		// `attributes` from useSortable spreads at minimum role + tabIndex + aria-* metadata.
		expect(item).toHaveAttribute("role");
		expect(item).toHaveAttribute("tabindex");
	});

	it("renders with isDragging=false in the static state", () => {
		render(
			<SortableList
				items={[{ id: "a", label: "A" }]}
				onChange={() => {}}
				renderItem={(item) => <SortableItem id={item.id} label={item.label} />}
			/>,
		);
		expect(screen.getByTestId("item-a")).toHaveAttribute("data-dragging", "false");
	});
});

describe("DndProvider", () => {
	it("renders children", () => {
		render(
			<DndProvider>
				<div data-testid="child">Hi</div>
			</DndProvider>,
		);
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it("forwards onDragEnd to dnd-kit (smoke — handler attached, no drag in jsdom)", () => {
		const onDragEnd = vi.fn();
		render(
			<DndProvider onDragEnd={onDragEnd}>
				<div>x</div>
			</DndProvider>,
		);
		// Real drag emission requires a pointer engine jsdom doesn't have. We
		// trust dnd-kit's own tests for the wiring; this renders without throwing.
		expect(onDragEnd).not.toHaveBeenCalled();
	});
});

describe("arrayMove (re-export)", () => {
	it("moves an item from oldIndex to newIndex", () => {
		expect(arrayMove(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
		expect(arrayMove(["a", "b", "c", "d"], 3, 0)).toEqual(["d", "a", "b", "c"]);
	});
});
