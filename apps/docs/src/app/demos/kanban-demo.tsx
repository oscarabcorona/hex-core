"use client";

import { useState } from "react";
import { Kanban, KanbanCard, KanbanColumn, type KanbanColumnData } from "../../components/ui";

const INITIAL: KanbanColumnData[] = [
	{ id: "todo", title: "To do", cardIds: ["1", "2", "3"] },
	{ id: "doing", title: "Doing", cardIds: ["4"] },
	{ id: "done", title: "Done", cardIds: ["5"] },
];

const CARDS: Record<string, { title: string; tag: string }> = {
	"1": { title: "Wire DnD primitives", tag: "infra" },
	"2": { title: "Build Kanban compound", tag: "feature" },
	"3": { title: "Update DataTable", tag: "feature" },
	"4": { title: "Senior review", tag: "review" },
	"5": { title: "Ship PR #N", tag: "release" },
};

export function KanbanDemo() {
	const [board, setBoard] = useState(INITIAL);

	return (
		<div className="w-full">
			<Kanban columns={board} onChange={setBoard}>
				{board.map((col) => (
					<KanbanColumn key={col.id} id={col.id} title={col.title}>
						{col.cardIds.map((cardId) => {
							const card = CARDS[cardId];
							if (!card) return null;
							return (
								<KanbanCard key={cardId} id={cardId}>
									<div className="font-medium">{card.title}</div>
									<div className="mt-1 text-xs text-muted-foreground">{card.tag}</div>
								</KanbanCard>
							);
						})}
					</KanbanColumn>
				))}
			</Kanban>
			<p className="mt-3 text-xs text-muted-foreground">
				Drag a card within or across columns. Keyboard: Tab to focus a card, Space to pick up,
				arrows to move (across columns too), Space to drop, Esc to cancel.
			</p>
		</div>
	);
}
