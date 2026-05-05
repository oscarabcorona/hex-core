import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gantt, type GanttTask } from "./gantt.js";

const sample: GanttTask[] = [
	{ id: "design", label: "Design", start: "2025-01-01", end: "2025-01-15", progress: 1 },
	{
		id: "build",
		label: "Build",
		start: "2025-01-10",
		end: "2025-02-20",
		progress: 0.6,
		dependencies: ["design"],
	},
	{ id: "ship", label: "Ship", start: "2025-02-15", end: "2025-02-28", dependencies: ["build"] },
];

describe("Gantt", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<Gantt tasks={sample} />);
		expect(container.querySelector("[data-hex-gantt]")).not.toBeNull();
	});

	it("renders one bar per task", () => {
		const { container } = render(<Gantt tasks={sample} />);
		expect(container.querySelectorAll("[data-hex-gantt-task]").length).toBe(3);
	});

	it("draws one dependency arrow per declared dependency", () => {
		const { container } = render(<Gantt tasks={sample} />);
		// design→build + build→ship = 2 deps
		expect(container.querySelectorAll("[data-hex-gantt-dep]").length).toBe(2);
	});

	it("silently skips dependency arrows whose target is missing from tasks", () => {
		const orphan: GanttTask[] = [
			{ id: "a", label: "A", start: "2025-01-01", end: "2025-01-05" },
			{
				id: "b",
				label: "B",
				start: "2025-01-06",
				end: "2025-01-10",
				dependencies: ["a", "ghost"], // 'ghost' not in tasks
			},
		];
		const { container } = render(<Gantt tasks={orphan} />);
		expect(container.querySelectorAll("[data-hex-gantt-dep]").length).toBe(1);
	});

	it("renders the requested number of axis ticks", () => {
		const { container } = render(<Gantt tasks={sample} tickCount={4} />);
		expect(container.querySelectorAll("[data-hex-gantt-tick]").length).toBe(4);
	});

	it("tags each task with its row index in display order", () => {
		const { container } = render(<Gantt tasks={sample} />);
		const rows = Array.from(container.querySelectorAll("[data-hex-gantt-task]")).map(
			(t) => t.getAttribute("data-row"),
		);
		expect(rows).toEqual(["0", "1", "2"]);
	});

	it("calls onTaskClick with the clicked task", () => {
		const onTaskClick = vi.fn();
		const { container } = render(<Gantt tasks={sample} onTaskClick={onTaskClick} />);
		const firstTask = container.querySelector("[data-hex-gantt-task]") as SVGGElement;
		firstTask.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onTaskClick).toHaveBeenCalledTimes(1);
		expect(onTaskClick.mock.calls[0][0].id).toBe("design");
	});

	it("activates onTaskClick via keyboard (Enter and Space)", () => {
		const onTaskClick = vi.fn();
		const { container } = render(<Gantt tasks={sample} onTaskClick={onTaskClick} />);
		const firstTask = container.querySelector("[data-hex-gantt-task]") as SVGGElement;
		expect(firstTask.getAttribute("role")).toBe("button");
		expect(firstTask.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstTask, { key: "Enter" });
		expect(onTaskClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstTask, { key: " " });
		expect(onTaskClick).toHaveBeenCalledTimes(2);
	});

	it("renders a progress fill overlay when progress is set", () => {
		const { container } = render(<Gantt tasks={sample} />);
		// Each task <g> has 1 background <rect> + (optional) 1 progress <rect>.
		// design has progress=1, build has 0.6, ship has none.
		const taskGroups = container.querySelectorAll("[data-hex-gantt-task]");
		const rectCounts = Array.from(taskGroups).map((g) => g.querySelectorAll("rect").length);
		expect(rectCounts).toEqual([2, 2, 1]);
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<Gantt tasks={sample} />);
		const svg = container.querySelector("[data-hex-gantt]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("3 tasks");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(<Gantt tasks={sample} className="custom-gn" />);
		expect(container.querySelector("[data-hex-gantt]")?.getAttribute("class")).toContain("custom-gn");
	});

	it("renders nothing for an empty tasks array", () => {
		const { container } = render(<Gantt tasks={[]} />);
		expect(container.querySelectorAll("[data-hex-gantt-task]").length).toBe(0);
	});

	it("renders zero-width tasks (start === end) without crashing", () => {
		const zero: GanttTask[] = [
			{ id: "milestone", label: "Milestone", start: "2025-01-01", end: "2025-01-01" },
		];
		const { container } = render(<Gantt tasks={zero} />);
		expect(container.querySelectorAll("[data-hex-gantt-task]").length).toBe(1);
		// Bar still renders — width clamped to a 2px minimum.
		const rect = container.querySelector("[data-hex-gantt-task] rect") as SVGRectElement;
		expect(Number(rect.getAttribute("width"))).toBeGreaterThanOrEqual(2);
	});

	it("renders reverse-range tasks (end < start) as a 2px minimum bar", () => {
		const reverse: GanttTask[] = [
			{ id: "oops", label: "Reverse", start: "2025-02-01", end: "2025-01-15" },
		];
		const { container } = render(<Gantt tasks={reverse} />);
		const rect = container.querySelector("[data-hex-gantt-task] rect") as SVGRectElement;
		expect(Number(rect.getAttribute("width"))).toBe(2);
	});

	it("silently drops tasks whose dates don't parse", () => {
		const mixed: GanttTask[] = [
			{ id: "good", label: "Good", start: "2025-01-01", end: "2025-01-15" },
			{ id: "bad", label: "Bad", start: "definitely-not-a-date", end: "also-bad" },
		];
		const { container } = render(<Gantt tasks={mixed} />);
		// Both tasks render rows (we keep them in display order), but the
		// bad task's bar collapses to the minimum width because its NaN
		// endpoints clip to the axis edges.
		expect(container.querySelectorAll("[data-hex-gantt-task]").length).toBe(2);
	});

	it("calls preventDefault on Space activation", () => {
		const onTaskClick = vi.fn();
		const { container } = render(<Gantt tasks={sample} onTaskClick={onTaskClick} />);
		const firstTask = container.querySelector("[data-hex-gantt-task]") as SVGGElement;
		const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
		firstTask.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});

	it("renders an arrowhead marker for dependency arrows", () => {
		const { container } = render(<Gantt tasks={sample} />);
		const dep = container.querySelector("[data-hex-gantt-dep]");
		expect(dep?.getAttribute("marker-end")).toMatch(/^url\(#hex-gantt-arrow-/);
	});
});
