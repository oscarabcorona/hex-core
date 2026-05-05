import { Gantt } from "../../components/ui";

/** Gantt demo: 3-task project schedule with progress fills + sequential dependencies. */
export function GanttDemo() {
	return (
		<Gantt
			tasks={[
				{ id: "design", label: "Design", start: "2025-01-01", end: "2025-01-15", progress: 1 },
				{
					id: "build",
					label: "Build",
					start: "2025-01-10",
					end: "2025-02-20",
					progress: 0.6,
					dependencies: ["design"],
				},
				{
					id: "ship",
					label: "Ship",
					start: "2025-02-15",
					end: "2025-02-28",
					dependencies: ["build"],
				},
			]}
		/>
	);
}
