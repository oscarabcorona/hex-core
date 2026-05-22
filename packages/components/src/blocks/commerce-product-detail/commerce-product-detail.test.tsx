import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceProductDetail } from "./commerce-product-detail.js";

describe("CommerceProductDetail", () => {
	it("renders the name as <h1>, the price, media, and slots", () => {
		render(
			<CommerceProductDetail
				name="Canvas Tote"
				price="$48"
				eyebrow="Bags"
				description="A roomy everyday tote."
				media={<img alt="Canvas tote, natural" src="/tote.jpg" />}
				options={<div>Size selector</div>}
				actions={<button type="button">Add to cart</button>}
			/>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Canvas Tote" })).toBeInTheDocument();
		expect(screen.getByText("$48")).toBeInTheDocument();
		expect(screen.getByText("Bags")).toBeInTheDocument();
		expect(screen.getByAltText("Canvas tote, natural")).toBeInTheDocument();
		expect(screen.getByText("Size selector")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Add to cart" })).toBeInTheDocument();
	});
});
