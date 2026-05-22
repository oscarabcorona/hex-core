import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceCart } from "./commerce-cart.js";

const ITEMS = [
	{ name: "Canvas Tote", price: "$48", quantity: 1, meta: "Natural" },
	{ name: "Wool Beanie", price: "$28", quantity: 2, meta: "Charcoal" },
];

describe("CommerceCart", () => {
	it("renders each line item, the summary, and actions", () => {
		render(
			<CommerceCart
				items={ITEMS}
				summary={<div>Total $104</div>}
				actions={<button type="button">Checkout</button>}
			/>,
		);
		expect(screen.getByRole("heading", { level: 3, name: "Canvas Tote" })).toBeInTheDocument();
		expect(screen.getByText("$48")).toBeInTheDocument();
		expect(screen.getByText("Qty 1")).toBeInTheDocument();
		expect(screen.getByText("Total $104")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Checkout" })).toBeInTheDocument();
	});

	it("renders per-item controls when provided", () => {
		render(
			<CommerceCart
				items={[{ name: "Tote", price: "$48", quantity: 1, controls: <button type="button">Remove Tote</button> }]}
			/>,
		);
		expect(screen.getByRole("button", { name: "Remove Tote" })).toBeInTheDocument();
	});
});
