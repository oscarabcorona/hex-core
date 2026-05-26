import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceQuickview } from "./commerce-quickview.js";

describe("CommerceQuickview", () => {
	it("renders name (h2), price, description, eyebrow, and the actions/detailsLink slots", () => {
		render(
			<CommerceQuickview
				name="Canvas Tote"
				price="$48"
				eyebrow="Bags"
				description="Roomy everyday tote."
				media={<img alt="Canvas tote" src="/tote.jpg" />}
				actions={<button type="button">Add to cart</button>}
				detailsLink={<a href="/p/tote">See full details</a>}
			/>,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Canvas Tote" })).toBeInTheDocument();
		expect(screen.getByText("$48")).toBeInTheDocument();
		expect(screen.getByText("Bags")).toBeInTheDocument();
		expect(screen.getByText("Roomy everyday tote.")).toBeInTheDocument();
		expect(screen.getByAltText("Canvas tote")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Add to cart" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "See full details" })).toHaveAttribute("href", "/p/tote");
	});
});
