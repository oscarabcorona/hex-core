import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Empty } from "./empty.js";

describe("Empty", () => {
	it("renders the title as an h3 by default", () => {
		render(<Empty title="No items" />);
		const heading = screen.getByRole("heading", { name: "No items", level: 3 });
		expect(heading).toBeInTheDocument();
	});

	it("renders the title with a custom heading level via titleAs", () => {
		render(<Empty title="No items" titleAs="h2" />);
		expect(screen.getByRole("heading", { name: "No items", level: 2 })).toBeInTheDocument();
	});

	it("wraps in a region landmark labeled by the title", () => {
		render(<Empty title="No items" />);
		const region = screen.getByRole("region", { name: "No items" });
		expect(region).toBeInTheDocument();
	});

	it("renders the description when provided", () => {
		render(<Empty title="No items" description="Try adjusting your filters." />);
		expect(screen.getByText("Try adjusting your filters.")).toBeInTheDocument();
	});

	it("renders the action slot when provided", () => {
		render(
			<Empty title="No items" action={<button type="button">Create one</button>} />,
		);
		expect(screen.getByRole("button", { name: "Create one" })).toBeInTheDocument();
	});

	it("hides the icon from assistive tech (aria-hidden)", () => {
		render(<Empty title="No items" icon={<span data-testid="icon">★</span>} />);
		// The icon wrapper should be aria-hidden so the title carries the accessible name.
		const icon = screen.getByTestId("icon");
		expect(icon.parentElement).toHaveAttribute("aria-hidden", "true");
	});
});
