"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	SortableList,
	useSortableItem,
} from "@hex-core/components";

interface Item {
	id: string;
	title: string;
	body: string;
}

const INITIAL: Item[] = [
	{ id: "1", title: "Plan sprint", body: "Pick next batch of components." },
	{ id: "2", title: "Write tests", body: "Mock the heavy peer + assert wiring." },
	{ id: "3", title: "Senior review", body: "Run the /senior-review flow before push." },
	{ id: "4", title: "Ship PR", body: "Bundle changeset, push, open PR." },
];

export function SortableCardsDemo() {
	const [items, setItems] = useState(INITIAL);

	return (
		<div className="w-full max-w-md">
			<SortableList
				items={items}
				onChange={setItems}
				renderItem={(item) => <SortableCard key={item.id} item={item} />}
			/>
			<p className="mt-3 text-xs text-muted-foreground">
				Drag a card to reorder. Keyboard: Tab to a card, Space to pick up, ↑/↓ to move, Space
				to drop, Esc to cancel.
			</p>
		</div>
	);
}

function SortableCard({ item }: { item: Item }) {
	const { setNodeRef, attributes, listeners, style, isDragging } = useSortableItem(item.id);
	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			data-dragging={isDragging}
			className="cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
		>
			<Card>
				<CardHeader>
					<CardTitle>{item.title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">{item.body}</p>
				</CardContent>
			</Card>
		</div>
	);
}
