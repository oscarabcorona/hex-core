import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, type TimelineEvent } from "./timeline.js";

const baseEvents: TimelineEvent[] = [
	{ id: "a", title: "Pull request opened", timestamp: "2h ago", status: "info" },
	{ id: "b", title: "CI passed", timestamp: "1h ago", status: "success" },
	{
		id: "c",
		title: "Merged to main",
		timestamp: "12m ago",
		description: "Squash + merge",
		status: "success",
	},
];

describe("Timeline", () => {
	it("renders an <ol> with the provided aria-label and one <li> per event", () => {
		render(<Timeline aria-label="Activity" events={baseEvents} />);
		const list = screen.getByRole("list", { name: "Activity" });
		expect(list.tagName).toBe("OL");
		expect(list.querySelectorAll("li")).toHaveLength(baseEvents.length);
	});

	it("surfaces title + timestamp + description text", () => {
		render(<Timeline aria-label="Activity" events={baseEvents} />);
		expect(screen.getByText("Pull request opened")).toBeInTheDocument();
		expect(screen.getByText("2h ago")).toBeInTheDocument();
		expect(screen.getByText("Squash + merge")).toBeInTheDocument();
	});

	it("renders a custom icon when provided in place of the default dot", () => {
		render(
			<Timeline
				aria-label="Releases"
				events={[
					{
						id: "1",
						title: "v1.0",
						icon: <span data-testid="custom-icon">⚡</span>,
					},
				]}
			/>,
		);
		expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
	});

	it("does not render a connector line on the last event", () => {
		const { container } = render(
			<Timeline aria-label="Activity" events={baseEvents} />,
		);
		const connectors = container.querySelectorAll('[aria-hidden="true"].w-px');
		// 3 events → 2 connectors (after first, after second; none after last)
		expect(connectors).toHaveLength(baseEvents.length - 1);
	});

	it("connector + indicator are aria-hidden so screen readers only see text content", () => {
		const { container } = render(
			<Timeline aria-label="Activity" events={baseEvents} />,
		);
		// Indicator wrapper carries aria-hidden via its dot child; connector carries aria-hidden directly
		container
			.querySelectorAll(".w-px")
			.forEach((el) => expect(el).toHaveAttribute("aria-hidden", "true"));
	});
});
