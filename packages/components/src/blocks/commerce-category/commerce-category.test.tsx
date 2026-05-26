import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceCategory } from "./commerce-category.js";

const CATEGORIES = [
	{ name: "Bags", href: "/c/bags", productCount: "24 items" },
	{ name: "Accessories", productCount: "48 items" },
];

describe("CommerceCategory", () => {
	it("renders each card's name (h3) + product count; href makes the card a link", () => {
		render(<CommerceCategory title="Shop by category" categories={CATEGORIES} />);
		expect(screen.getByRole("heading", { level: 2, name: "Shop by category" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Bags" })).toBeInTheDocument();
		expect(screen.getByText("24 items")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Bags/ })).toHaveAttribute("href", "/c/bags");
		expect(screen.queryByRole("link", { name: /Accessories/ })).not.toBeInTheDocument();
	});
});
