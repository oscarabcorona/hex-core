import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompareTable, type CompareAttribute, type CompareSubject } from "./compare-table.js";

const subjects: CompareSubject[] = [
	{ id: "linux", label: "Linux" },
	{ id: "mac", label: "Mac" },
	{ id: "win", label: "Windows" },
];

const attributes: CompareAttribute[] = [
	{ id: "kernel", label: "Kernel", values: { linux: "Linux", mac: "Darwin", win: "NT" } },
	{ id: "fs", label: "Default FS", values: { linux: "ext4", mac: "APFS", win: "NTFS" } },
];

describe("CompareTable", () => {
	it("renders one column header per subject", () => {
		const { container } = render(<CompareTable subjects={subjects} attributes={attributes} />);
		expect(container.querySelectorAll("[data-hex-compare-table-subject]").length).toBe(3);
	});

	it("renders one row per attribute", () => {
		const { container } = render(<CompareTable subjects={subjects} attributes={attributes} />);
		expect(container.querySelectorAll("[data-hex-compare-table-row]").length).toBe(2);
	});

	it("renders one cell per (subject, attribute) pair", () => {
		const { container } = render(<CompareTable subjects={subjects} attributes={attributes} />);
		expect(container.querySelectorAll("[data-hex-compare-table-cell]").length).toBe(6);
	});

	it("renders an em dash placeholder for missing subject values", () => {
		const sparse: CompareAttribute[] = [
			{ id: "fs", label: "Default FS", values: { linux: "ext4" } },
		];
		const { container } = render(<CompareTable subjects={subjects} attributes={sparse} />);
		const cells = Array.from(container.querySelectorAll("[data-hex-compare-table-cell]"));
		const macCell = cells.find((c) => c.getAttribute("data-subject-id") === "mac");
		expect(macCell?.textContent).toBe("—");
	});

	it("does not flag any cell as differing when highlightDifferences is off", () => {
		const { container } = render(<CompareTable subjects={subjects} attributes={attributes} />);
		const flagged = Array.from(
			container.querySelectorAll('[data-hex-compare-table-cell][data-differs="true"]'),
		);
		expect(flagged.length).toBe(0);
	});

	it("flags cells that differ from the row reference when highlightDifferences is on", () => {
		const { container } = render(
			<CompareTable subjects={subjects} attributes={attributes} highlightDifferences />,
		);
		// Row "kernel": linux="Linux", mac="Darwin", win="NT". Reference is "Linux".
		// linux matches reference → not flagged. mac and win differ → flagged.
		const kernelCells = Array.from(
			container.querySelectorAll('[data-hex-compare-table-row][data-attribute-id="kernel"] [data-hex-compare-table-cell]'),
		);
		const flaggedIds = kernelCells
			.filter((c) => c.getAttribute("data-differs") === "true")
			.map((c) => c.getAttribute("data-subject-id"));
		expect(flaggedIds.sort()).toEqual(["mac", "win"]);
	});

	it("calls onCellClick with (subjectId, attributeId) when a cell is clicked", () => {
		const onCellClick = vi.fn();
		const { container } = render(
			<CompareTable subjects={subjects} attributes={attributes} onCellClick={onCellClick} />,
		);
		const firstCell = container.querySelector("[data-hex-compare-table-cell]") as HTMLTableCellElement;
		fireEvent.click(firstCell);
		expect(onCellClick).toHaveBeenCalledWith("linux", "kernel");
	});

	it("warns in dev when an attribute references an unknown subjectId", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const orphaned: CompareAttribute[] = [
			{ id: "fs", label: "Default FS", values: { linux: "ext4", android: "EXT4" } }, // android missing from subjects
		];
		render(<CompareTable subjects={subjects} attributes={orphaned} />);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0][0]).toContain("CompareTable");
		expect(warn.mock.calls[0][0]).toContain("android");
		warn.mockRestore();
	});

	it("renders semantically as a <table> with thead and tbody", () => {
		const { container } = render(<CompareTable subjects={subjects} attributes={attributes} />);
		expect(container.querySelector("table")).not.toBeNull();
		expect(container.querySelector("thead")).not.toBeNull();
		expect(container.querySelector("tbody")).not.toBeNull();
	});

	it("uses scope=row on attribute label cells and scope=col on subject headers", () => {
		const { container } = render(<CompareTable subjects={subjects} attributes={attributes} />);
		const colHeaders = container.querySelectorAll('th[scope="col"]');
		// 1 corner + 3 subject headers = 4 col scopes
		expect(colHeaders.length).toBe(4);
		// 2 attribute label rows
		expect(container.querySelectorAll('th[scope="row"]').length).toBe(2);
	});

	it("merges className onto the outer container", () => {
		const { container } = render(
			<CompareTable subjects={subjects} attributes={attributes} className="custom-ct" />,
		);
		expect(container.querySelector("[data-hex-compare-table]")?.getAttribute("class")).toContain("custom-ct");
	});

	it("renders without errors for empty subjects/attributes arrays", () => {
		const { container } = render(<CompareTable subjects={[]} attributes={[]} />);
		expect(container.querySelectorAll("[data-hex-compare-table-cell]").length).toBe(0);
	});

	it("fires onCellClick on missing-value cells too (the placeholder cell is still interactive)", () => {
		const onCellClick = vi.fn();
		const sparse: CompareAttribute[] = [
			{ id: "fs", label: "Default FS", values: { linux: "ext4" } }, // mac + win missing
		];
		const { container } = render(
			<CompareTable subjects={subjects} attributes={sparse} onCellClick={onCellClick} />,
		);
		const macCell = container.querySelector(
			'[data-hex-compare-table-cell][data-subject-id="mac"][data-attribute-id="fs"]',
		) as HTMLTableCellElement;
		fireEvent.click(macCell);
		expect(onCellClick).toHaveBeenCalledWith("mac", "fs");
	});

	it("does not flag rich ReactElement cells as differing in highlight mode", () => {
		const richAttrs: CompareAttribute[] = [
			{
				id: "icon",
				label: "Icon",
				values: {
					linux: <span>L</span>,
					mac: <span>M</span>,
					win: <span>W</span>,
				},
			},
		];
		const { container } = render(
			<CompareTable subjects={subjects} attributes={richAttrs} highlightDifferences />,
		);
		const flagged = container.querySelectorAll('[data-hex-compare-table-cell][data-differs="true"]');
		expect(flagged.length).toBe(0);
	});
});
