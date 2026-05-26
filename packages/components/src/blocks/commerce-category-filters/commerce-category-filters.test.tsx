import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceCategoryFilters } from "./commerce-category-filters.js";

describe("CommerceCategoryFilters", () => {
	it("renders aside labelled Filters + each group title, content, and open state", () => {
		const { container } = render(
			<CommerceCategoryFilters
				title="Filters"
				groups={[
					{ title: "Price", content: <div>Price slider</div> },
					{ title: "Color", content: <div>Color picker</div>, defaultOpen: false },
				]}
			/>,
		);
		expect(screen.getByRole("complementary", { name: "Filters" })).toBeInTheDocument();
		expect(screen.getByText("Price")).toBeInTheDocument();
		expect(screen.getByText("Color")).toBeInTheDocument();
		expect(screen.getByText("Price slider")).toBeInTheDocument();
		// Each group renders a native <details> with the right open state.
		const details = container.querySelectorAll("details");
		expect(details.length).toBe(2);
		expect(details[0].open).toBe(true);
		expect(details[1].open).toBe(false);
	});
});
