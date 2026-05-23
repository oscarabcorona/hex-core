import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceProductGrid } from "./commerce-product-grid.js";

const PRODUCTS = [
	{ name: "Canvas Tote", price: "$48", href: "/p/tote", meta: "Natural" },
	{ name: "Wool Beanie", price: "$28", meta: "Charcoal" },
];

describe("CommerceProductGrid", () => {
	it("renders the heading and each product's name, price, and meta", () => {
		render(<CommerceProductGrid title="New arrivals" products={PRODUCTS} />);
		expect(screen.getByRole("heading", { level: 2, name: "New arrivals" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Canvas Tote" })).toBeInTheDocument();
		expect(screen.getByText("$48")).toBeInTheDocument();
		expect(screen.getByText("Natural")).toBeInTheDocument();
	});

	it("wraps a product in a link only when href is set", () => {
		render(<CommerceProductGrid products={PRODUCTS} />);
		expect(screen.getByRole("link", { name: /Canvas Tote/ })).toHaveAttribute("href", "/p/tote");
		// Wool Beanie has no href → not a link.
		expect(screen.queryByRole("link", { name: /Wool Beanie/ })).not.toBeInTheDocument();
	});
});
