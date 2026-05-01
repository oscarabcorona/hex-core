"use client";

import "reactflow/dist/style.css";
import { Canvas } from "../../components/ui";

export function CanvasDemo() {
	const nodes = [
		{ id: "1", position: { x: 0, y: 50 }, data: { label: "User query" } },
		{ id: "2", position: { x: 220, y: 0 }, data: { label: "Retrieve context" } },
		{ id: "3", position: { x: 220, y: 100 }, data: { label: "Plan steps" } },
		{ id: "4", position: { x: 440, y: 50 }, data: { label: "Generate response" } },
	];
	const edges = [
		{ id: "e1-2", source: "1", target: "2" },
		{ id: "e1-3", source: "1", target: "3" },
		{ id: "e2-4", source: "2", target: "4" },
		{ id: "e3-4", source: "3", target: "4" },
	];

	return (
		<div className="w-full max-w-2xl h-[320px]">
			<Canvas nodes={nodes} edges={edges} />
		</div>
	);
}
