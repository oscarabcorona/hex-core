import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loading } from "./loading.js";

describe("Loading", () => {
	it("announces 'Loading…' to screen readers via aria-live polite", () => {
		render(<Loading />);
		const status = screen.getByRole("status");
		expect(status).toHaveAttribute("aria-live", "polite");
		expect(status).toHaveTextContent("Loading…");
	});

	it("respects a custom label", () => {
		render(<Loading label="Fetching data" />);
		expect(screen.getByRole("status")).toHaveTextContent("Fetching data");
	});

	it("renders the requested number of rows in list variant", () => {
		const { container } = render(<Loading rows={5} variant="list" />);
		// Each list row is one Skeleton div with animate-pulse.
		const skeletons = container.querySelectorAll(".animate-pulse");
		expect(skeletons.length).toBe(5);
	});

	it("renders 3 skeletons per row in card variant (heading + 2 body lines)", () => {
		const { container } = render(<Loading rows={2} variant="card" />);
		// Card variant emits 3 Skeletons per row × 2 rows = 6 total.
		const skeletons = container.querySelectorAll(".animate-pulse");
		expect(skeletons.length).toBe(6);
	});

	it("renders an avatar + 2-line stack per row in stack variant", () => {
		const { container } = render(<Loading rows={2} variant="stack" />);
		// Stack variant emits 3 Skeletons per row (avatar + 2 lines) × 2 rows = 6 total.
		const skeletons = container.querySelectorAll(".animate-pulse");
		expect(skeletons.length).toBe(6);
	});
});
