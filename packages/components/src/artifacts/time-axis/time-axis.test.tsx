import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimeAxis, type TimeAxisEvent } from "./time-axis.js";

const sample: TimeAxisEvent[] = [
	{ id: "v1", label: "v1.0", date: "2025-01-15" },
	{ id: "v2", label: "v2.0", date: "2025-04-20" },
	{ id: "v3", label: "v3.0", date: "2025-09-10" },
];

describe("TimeAxis", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<TimeAxis events={sample} />);
		expect(container.querySelector("[data-hex-time-axis]")).not.toBeNull();
	});

	it("renders one event group per event", () => {
		const { container } = render(<TimeAxis events={sample} />);
		expect(container.querySelectorAll("[data-hex-time-axis-event]").length).toBe(3);
	});

	it("renders the requested number of axis ticks", () => {
		const { container } = render(<TimeAxis events={sample} tickCount={4} />);
		expect(container.querySelectorAll("[data-hex-time-axis-tick]").length).toBe(4);
	});

	it("places events horizontally according to their dates", () => {
		const { container } = render(<TimeAxis events={sample} width={720} />);
		const eventGroups = Array.from(container.querySelectorAll("[data-hex-time-axis-event]"));
		const xs = eventGroups.map((g) => Number(g.querySelector("circle")?.getAttribute("cx") ?? 0));
		// First event (v1) leftmost, last event (v3) rightmost
		expect(xs[0]).toBeLessThan(xs[xs.length - 1]);
	});

	it("stacks colliding events into multiple rows", () => {
		// Three events in a tight cluster, axis pinned to a year so they
		// land within the leftmost few pixels — forces stacking by the
		// 48px-min-gap heuristic.
		const close: TimeAxisEvent[] = [
			{ id: "a", label: "Aaaa", date: "2025-01-01" },
			{ id: "b", label: "Bbbb", date: "2025-01-02" },
			{ id: "c", label: "Cccc", date: "2025-01-03" },
		];
		const { container } = render(
			<TimeAxis events={close} start="2025-01-01" end="2025-12-31" width={720} />,
		);
		const rows = Array.from(container.querySelectorAll("[data-hex-time-axis-event]")).map(
			(e) => Number(e.getAttribute("data-row")),
		);
		expect(new Set(rows).size).toBeGreaterThan(1);
	});

	it("respects explicit start/end overrides", () => {
		// Span the whole year even though events are clustered in Q1
		const { container } = render(
			<TimeAxis events={sample} start="2025-01-01" end="2025-12-31" width={720} />,
		);
		const desc = container.querySelector("[data-hex-time-axis] desc")?.textContent ?? "";
		expect(desc).toContain("2025-01-01");
		expect(desc).toContain("2025-12-31");
	});

	it("calls onEventClick with the clicked event", () => {
		const onEventClick = vi.fn();
		const { container } = render(<TimeAxis events={sample} onEventClick={onEventClick} />);
		const firstEvent = container.querySelector("[data-hex-time-axis-event]") as SVGGElement;
		firstEvent.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onEventClick).toHaveBeenCalledTimes(1);
		expect(["v1", "v2", "v3"]).toContain(onEventClick.mock.calls[0][0].id);
	});

	it("activates onEventClick via keyboard (Enter and Space)", () => {
		const onEventClick = vi.fn();
		const { container } = render(<TimeAxis events={sample} onEventClick={onEventClick} />);
		const firstEvent = container.querySelector("[data-hex-time-axis-event]") as SVGGElement;
		expect(firstEvent.getAttribute("role")).toBe("button");
		expect(firstEvent.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstEvent, { key: "Enter" });
		expect(onEventClick).toHaveBeenCalledTimes(1);
		fireEvent.keyDown(firstEvent, { key: " " });
		expect(onEventClick).toHaveBeenCalledTimes(2);
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<TimeAxis events={sample} />);
		const svg = container.querySelector("[data-hex-time-axis]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("3 events");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(<TimeAxis events={sample} className="custom-ta" />);
		expect(container.querySelector("[data-hex-time-axis]")?.getAttribute("class")).toContain("custom-ta");
	});

	it("renders the axis baseline even with no events", () => {
		const { container } = render(<TimeAxis events={[]} />);
		expect(container.querySelectorAll("[data-hex-time-axis-event]").length).toBe(0);
		expect(container.querySelector("[data-hex-time-axis-axis]")).not.toBeNull();
	});

	it("accepts Date, ISO string, and epoch ms interchangeably for `date`", () => {
		const mixed: TimeAxisEvent[] = [
			{ id: "a", label: "ISO", date: "2025-01-01" },
			{ id: "b", label: "Date", date: new Date("2025-06-01") },
			{ id: "c", label: "Epoch", date: new Date("2025-12-01").getTime() },
		];
		const { container } = render(<TimeAxis events={mixed} />);
		expect(container.querySelectorAll("[data-hex-time-axis-event]").length).toBe(3);
	});

	it("silently drops events with unparseable dates instead of crashing", () => {
		const mixed: TimeAxisEvent[] = [
			{ id: "a", label: "Good", date: "2025-01-01" },
			{ id: "b", label: "Bad", date: "definitely-not-a-date" },
			{ id: "c", label: "Also good", date: "2025-06-01" },
		];
		const { container } = render(<TimeAxis events={mixed} />);
		expect(container.querySelectorAll("[data-hex-time-axis-event]").length).toBe(2);
	});

	it("assigns deterministic rows for events with identical timestamps", () => {
		// Same date → tiebreaker on id. Run twice and confirm rows match.
		const sameDay: TimeAxisEvent[] = [
			{ id: "z", label: "Zzz", date: "2025-01-01" },
			{ id: "a", label: "Aaa", date: "2025-01-01" },
			{ id: "m", label: "Mmm", date: "2025-01-01" },
		];
		const renderRows = () => {
			const { container } = render(<TimeAxis events={sameDay} />);
			return Array.from(container.querySelectorAll("[data-hex-time-axis-event]")).map(
				(e) => e.getAttribute("data-row"),
			);
		};
		expect(renderRows()).toEqual(renderRows());
	});

	it("calls preventDefault on Space activation so the page doesn't scroll", () => {
		const onEventClick = vi.fn();
		const { container } = render(<TimeAxis events={sample} onEventClick={onEventClick} />);
		const firstEvent = container.querySelector("[data-hex-time-axis-event]") as SVGGElement;
		const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
		firstEvent.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});
});
