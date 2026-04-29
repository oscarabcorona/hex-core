import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./progress.js";

describe("Progress", () => {
	it("renders an accessible progressbar role", () => {
		render(<Progress value={40} aria-label="Loading" />);
		expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();
	});

	it("reflects the value via aria-valuenow", () => {
		render(<Progress value={60} aria-label="t" />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
	});

	it("uses max=100 by default", () => {
		render(<Progress value={25} aria-label="t" />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "100");
	});

	it("respects a custom max", () => {
		render(<Progress value={25} max={50} aria-label="t" />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "50");
	});

	it("clamps undefined value to 0 in the ARIA wiring", () => {
		render(<Progress aria-label="t" />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
	});

	it("merges consumer className with default classes", () => {
		render(<Progress value={10} aria-label="t" className="custom-class" />);
		const bar = screen.getByRole("progressbar");
		expect(bar).toHaveClass("custom-class");
		expect(bar).toHaveClass("rounded-full");
	});

	it("forwards ref to the underlying root element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(<Progress value={10} aria-label="t" ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});
