import { TimeAxis } from "@hex-core/components";

/** TimeAxis demo: four major version-release events plotted across a year. */
export function TimeAxisDemo() {
	return (
		<TimeAxis
			events={[
				{ id: "v1", label: "v1.0", date: "2025-01-15" },
				{ id: "v2", label: "v2.0", date: "2025-04-20" },
				{ id: "v3", label: "v3.0", date: "2025-09-10" },
				{ id: "v4", label: "v4.0", date: "2026-01-30" },
			]}
		/>
	);
}
