"use client";

import { Timeline } from "@hex-core/components";

const activity = [
	{
		id: "1",
		title: "Pull request opened",
		timestamp: "2 hours ago",
		description: "Add MultiCombobox + DatePicker year-selector + Stepper",
		status: "info" as const,
	},
	{
		id: "2",
		title: "CI passed",
		timestamp: "1 hour ago",
		status: "success" as const,
	},
	{
		id: "3",
		title: "Reviewer requested changes",
		timestamp: "32 minutes ago",
		description: "Two nits on aria-label coverage in MultiCombobox",
		status: "warning" as const,
	},
	{
		id: "4",
		title: "Merged to main",
		timestamp: "12 minutes ago",
		description: "Squash + merge by @oscar",
		status: "success" as const,
	},
];

const releases = [
	{ id: "v1", title: "v1.0.0", timestamp: "Apr 24" },
	{
		id: "v1-1",
		title: "v1.1.0",
		timestamp: "Apr 27",
		description: "Theme D primitives — MultiCombobox, Stepper, year-selector",
		status: "success" as const,
	},
];

/**
 * Timeline demo: two variants — a multi-status activity log and a compact
 * release-notes feed using the smaller indicator size.
 */
export function TimelineDemo() {
	return (
		<div className="flex flex-col gap-8">
			<div>
				<p className="mb-3 text-xs font-medium text-muted-foreground">
					Activity log
				</p>
				<Timeline aria-label="Activity log" events={activity} />
			</div>

			<div>
				<p className="mb-3 text-xs font-medium text-muted-foreground">
					Release notes (compact)
				</p>
				<Timeline aria-label="Release notes" size="sm" events={releases} />
			</div>
		</div>
	);
}
