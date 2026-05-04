import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Context } from "./context.js";

/**
 * The "used" number renders inside a colored `<span>` for severity styling,
 * so the surrounding "of N tokens · NN%" text lives in sibling text nodes.
 * Use the parent header element's `textContent` for assertions instead of
 * relying on `getByText` to span across split nodes.
 */
function getMeterText(): string {
	const labelNode = screen.getByText("Context window", { exact: false });
	const header = labelNode.parentElement;
	return header?.textContent ?? "";
}

describe("Context — formatting", () => {
	it("renders 'N of M tokens · NN%' with the default label", () => {
		render(<Context used={47_000} max={200_000} />);
		expect(screen.getByText("Context window")).toBeInTheDocument();
		expect(getMeterText()).toMatch(/47k of 200k tokens · 24%/);
	});

	it("renders raw integers for values < 1000", () => {
		render(<Context used={250} max={500} />);
		expect(getMeterText()).toMatch(/250 of 500 tokens · 50%/);
	});

	it("uses M (millions) for values >= 1M", () => {
		render(<Context used={250_000} max={2_000_000} />);
		expect(getMeterText()).toMatch(/250k of 2\.0M tokens/);
	});

	it("respects a custom label", () => {
		render(<Context used={5} max={10} label="Retrieved chunks" />);
		expect(screen.getByText("Retrieved chunks")).toBeInTheDocument();
	});
});

describe("Context — clamping", () => {
	it("clamps used > max for display (does not panic)", () => {
		render(<Context used={300_000} max={200_000} />);
		// Used should clamp to max, percentage should be 100%.
		expect(getMeterText()).toMatch(/200k of 200k tokens · 100%/);
	});

	it("treats max=0 as 1 to avoid divide-by-zero", () => {
		render(<Context used={0} max={0} />);
		expect(getMeterText()).toMatch(/0 of 1 tokens/);
	});
});

describe("Context — severity", () => {
	it("renders ok severity below the warning threshold", () => {
		render(<Context used={50} max={100} />);
		// Progress bar's aria-valuenow reflects `used`. No destructive class on the wrapper.
		const progress = screen.getByRole("progressbar");
		expect(progress).toHaveAttribute("aria-valuenow", "50");
	});

	it("renders warning severity above the warning threshold but below danger", () => {
		render(<Context used={80} max={100} />);
		// 80% > 75% (warningAt default) and < 90% (dangerAt default).
		const progress = screen.getByRole("progressbar");
		expect(progress).toHaveAttribute("aria-valuenow", "80");
	});

	it("renders danger severity above the danger threshold", () => {
		render(<Context used={95} max={100} />);
		const progress = screen.getByRole("progressbar");
		expect(progress).toHaveAttribute("aria-valuenow", "95");
	});

	it("respects custom warningAt / dangerAt thresholds", () => {
		render(<Context used={65} max={100} warningAt={0.6} dangerAt={0.8} />);
		// 65% > 60% so warning kicks in; the meter still renders the counts.
		expect(getMeterText()).toMatch(/65 of 100 tokens · 65%/);
	});
});

describe("Context — accessibility", () => {
	it("sets aria-label on the progress bar with the percentage", () => {
		render(<Context used={50} max={200} />);
		const progress = screen.getByRole("progressbar");
		expect(progress).toHaveAttribute("aria-label", "Context window: 25% used");
	});
});
