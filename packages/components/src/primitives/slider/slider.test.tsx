import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Slider } from "./slider.js";

describe("Slider a11y wiring", () => {
	it("mirrors the Root aria-label onto a single thumb", () => {
		render(<Slider aria-label="Volume" defaultValue={[40]} max={100} />);
		expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
	});

	it("uses thumbLabels to disambiguate each thumb in a range slider", () => {
		render(
			<Slider
				aria-label="Price range"
				thumbLabels={["Minimum price", "Maximum price"]}
				defaultValue={[20, 80]}
				min={0}
				max={100}
			/>,
		);
		expect(
			screen.getByRole("slider", { name: "Minimum price" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("slider", { name: "Maximum price" }),
		).toBeInTheDocument();
	});

	it("falls back to indexed labels when only Root aria-label is provided for a range", () => {
		render(
			<Slider
				aria-label="Price range"
				defaultValue={[20, 80]}
				min={0}
				max={100}
			/>,
		);
		expect(
			screen.getByRole("slider", { name: "Price range (1 of 2)" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("slider", { name: "Price range (2 of 2)" }),
		).toBeInTheDocument();
	});

	it("prefers thumbLabels over Root aria-label on a single-thumb slider (no double-labelling)", () => {
		render(
			<Slider
				aria-label="Volume"
				thumbLabels={["Custom volume"]}
				defaultValue={[40]}
				max={100}
			/>,
		);
		expect(
			screen.getByRole("slider", { name: "Custom volume" }),
		).toBeInTheDocument();
		// "Volume" is set on the Root for non-Thumb assistive announcements,
		// but the Thumb itself must answer to "Custom volume" only.
		expect(screen.queryByRole("slider", { name: "Volume" })).toBeNull();
	});
});

describe("Slider thumbLabels length validation", () => {
	let warn: ReturnType<typeof vi.spyOn>;
	beforeEach(() => {
		warn = vi.spyOn(console, "warn").mockImplementation(() => {});
	});
	afterEach(() => {
		warn.mockRestore();
	});

	it("warns in development when thumbLabels.length !== value.length", () => {
		render(
			<Slider
				aria-label="Range"
				thumbLabels={["Only one"]}
				defaultValue={[20, 80]}
				min={0}
				max={100}
			/>,
		);
		expect(warn).toHaveBeenCalledOnce();
		expect(warn.mock.calls[0]?.[0]).toMatch(/thumbLabels\.length \(1\)/);
		expect(warn.mock.calls[0]?.[0]).toMatch(/value\.length \(2\)/);
	});

	it("does not warn when thumbLabels matches value length", () => {
		render(
			<Slider
				aria-label="Range"
				thumbLabels={["A", "B"]}
				defaultValue={[20, 80]}
				min={0}
				max={100}
			/>,
		);
		expect(warn).not.toHaveBeenCalled();
	});
});
