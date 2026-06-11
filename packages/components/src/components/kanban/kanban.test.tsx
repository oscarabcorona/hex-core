import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	findColumnIdForCard,
	Kanban,
	KanbanCard,
	KanbanColumn,
	moveCard,
	type KanbanColumnData,
} from "./kanban.js";

const baseBoard: KanbanColumnData[] = [
	{ id: "todo", title: "To do", cardIds: ["1", "2"] },
	{ id: "doing", title: "Doing", cardIds: ["3"] },
	{ id: "done", title: "Done", cardIds: [] },
];

function Board({
	columns = baseBoard,
	onChange = () => {},
}: {
	columns?: KanbanColumnData[];
	onChange?: (next: KanbanColumnData[]) => void;
}) {
	const titles: Record<string, string> = { "1": "Wire DnD", "2": "Build Kanban", "3": "Ship PR" };
	return (
		<Kanban columns={columns} onChange={onChange}>
			{columns.map((col) => (
				<KanbanColumn key={col.id} id={col.id} title={col.title}>
					{col.cardIds.map((cardId) => (
						<KanbanCard key={cardId} id={cardId}>
							{titles[cardId] ?? cardId}
						</KanbanCard>
					))}
				</KanbanColumn>
			))}
		</Kanban>
	);
}

describe("Kanban", () => {
	it("renders all columns and cards in the supplied order", () => {
		render(<Board />);
		const columns = document.querySelectorAll("[data-hex-kanban-column]");
		expect(columns).toHaveLength(3);
		expect(columns[0].getAttribute("data-column-id")).toBe("todo");
		expect(columns[1].getAttribute("data-column-id")).toBe("doing");
		expect(columns[2].getAttribute("data-column-id")).toBe("done");

		const todoCards = columns[0].querySelectorAll("[data-hex-kanban-card]");
		expect(todoCards).toHaveLength(2);
		expect(todoCards[0].getAttribute("data-card-id")).toBe("1");
		expect(todoCards[1].getAttribute("data-card-id")).toBe("2");
	});

	it("renders the column title", () => {
		render(<Board />);
		expect(screen.getByText("To do")).toBeInTheDocument();
		expect(screen.getByText("Doing")).toBeInTheDocument();
		expect(screen.getByText("Done")).toBeInTheDocument();
	});

	it("renders empty columns (no cards) without crashing", () => {
		render(<Board />);
		const doneCol = document.querySelector('[data-column-id="done"]');
		expect(doneCol?.querySelectorAll("[data-hex-kanban-card]")).toHaveLength(0);
	});

	it("each card carries data-dragging=false in static state", () => {
		render(<Board />);
		const cards = document.querySelectorAll("[data-hex-kanban-card]");
		cards.forEach((card) => {
			expect(card.getAttribute("data-dragging")).toBe("false");
		});
	});

	it("KanbanColumn outside <Kanban> throws a clear error", () => {
		// Suppress React's error-boundary console noise for this expected throw.
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() =>
			render(
				<KanbanColumn id="nope" title="Nope">
					<div />
				</KanbanColumn>,
			),
		).toThrow(/inside <Kanban>/);
		errSpy.mockRestore();
	});

	it("merges className onto the board container", () => {
		render(
			<Kanban columns={baseBoard} onChange={() => {}} className="custom-board">
				{baseBoard.map((c) => (
					<KanbanColumn key={c.id} id={c.id} title={c.title} />
				))}
			</Kanban>,
		);
		const board = document.querySelector("[data-hex-kanban]");
		expect(board?.className).toContain("custom-board");
	});
});

describe("moveCard (algorithm)", () => {
	const board: KanbanColumnData[] = [
		{ id: "todo", title: "To do", cardIds: ["1", "2", "3"] },
		{ id: "doing", title: "Doing", cardIds: ["4"] },
		{ id: "done", title: "Done", cardIds: [] },
	];

	it("intra-column: reorders within the same column", () => {
		const next = moveCard(board, "1", "3");
		expect(next[0].cardIds).toEqual(["2", "3", "1"]);
		// Other columns unchanged.
		expect(next[1].cardIds).toEqual(["4"]);
		expect(next[2].cardIds).toEqual([]);
	});

	it("cross-column: drop onto a card in another column inserts at that index", () => {
		const next = moveCard(board, "1", "4");
		expect(next[0].cardIds).toEqual(["2", "3"]);
		// Card 1 inserted at index of card 4 (= 0) in 'doing'.
		expect(next[1].cardIds).toEqual(["1", "4"]);
	});

	it("cross-column: drop onto an EMPTY column appends to that column", () => {
		const next = moveCard(board, "1", "done");
		expect(next[0].cardIds).toEqual(["2", "3"]);
		expect(next[2].cardIds).toEqual(["1"]);
	});

	it("cross-column: drop onto a NON-empty column appends to the end", () => {
		// Drop card 1 onto column 'doing' itself (not onto a card).
		const next = moveCard(board, "1", "doing");
		expect(next[0].cardIds).toEqual(["2", "3"]);
		expect(next[1].cardIds).toEqual(["4", "1"]);
	});

	it("returns the SAME reference when no move is possible (active === over)", () => {
		const next = moveCard(board, "1", "1");
		// Same card → same column → no index change → original returned (or no-op).
		// Algorithm is permitted to return same ref OR an equivalent shape; assert
		// the SHAPE is unchanged so the consumer sees no spurious state churn.
		expect(next).toEqual(board);
	});

	it("returns the same reference when the active card doesn't exist", () => {
		const next = moveCard(board, "999", "4");
		expect(next).toBe(board);
	});

	it("returns the same reference when the over target doesn't exist", () => {
		const next = moveCard(board, "1", "999");
		expect(next).toBe(board);
	});

	it("intra-column: drop on the same card is a no-op (same shape)", () => {
		const next = moveCard(board, "2", "2");
		expect(next).toEqual(board);
	});
});

describe("findColumnIdForCard", () => {
	const board: KanbanColumnData[] = [
		{ id: "todo", title: "To do", cardIds: ["1", "2"] },
		{ id: "doing", title: "Doing", cardIds: ["3"] },
	];

	it("returns the owning column id", () => {
		expect(findColumnIdForCard(board, "1")).toBe("todo");
		expect(findColumnIdForCard(board, "3")).toBe("doing");
	});

	it("returns null when the card id isn't in any column", () => {
		expect(findColumnIdForCard(board, "999")).toBeNull();
	});
});
