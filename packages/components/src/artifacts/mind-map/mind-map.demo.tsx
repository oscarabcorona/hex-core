import { MindMap } from "@hex-core/components";

/** MindMap demo: a small project tree with UI / API / DB branches and one nested leaf. */
export function MindMapDemo() {
	return (
		<MindMap
			root={{
				id: "root",
				label: "Project",
				children: [
					{ id: "ui", label: "UI", children: [{ id: "btn", label: "Button" }] },
					{ id: "api", label: "API" },
					{ id: "db", label: "DB" },
				],
			}}
		/>
	);
}
