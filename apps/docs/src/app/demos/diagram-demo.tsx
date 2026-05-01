"use client";

import { Diagram } from "../../components/ui";

const SOURCE = `flowchart LR
  Q[User query] --> R[Retrieve]
  Q --> P[Plan]
  R --> G[Generate]
  P --> G
  G --> A[Answer]`;

export function DiagramDemo() {
	return (
		<div className="w-full max-w-2xl">
			<Diagram>{SOURCE}</Diagram>
			<p className="mt-2 text-xs text-muted-foreground">
				Render Mermaid source as inline SVG. For AI agents that emit `flowchart` / `sequenceDiagram` blocks.
			</p>
		</div>
	);
}
