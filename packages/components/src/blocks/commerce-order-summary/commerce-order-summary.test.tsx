import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceOrderSummary } from "./commerce-order-summary.js";

const ITEMS = [
	{ name: "Canvas Tote", price: "$48", quantity: 1, meta: "Natural" },
	{ name: "Wool Beanie", price: "$56", quantity: 2, meta: "Charcoal" },
];

const TOTALS = [
	{ label: "Subtotal", value: "$104" },
	{ label: "Shipping", value: "Free" },
	{ label: "Total", value: "$104", emphasized: true },
];

describe("CommerceOrderSummary", () => {
	it("renders order header, items, totals with the emphasized Total row", () => {
		render(
			<CommerceOrderSummary
				orderId="#1042"
				items={ITEMS}
				totals={TOTALS}
				status={<span>Confirmed</span>}
			/>,
		);
		expect(screen.getByRole("heading", { level: 2, name: /Order #1042/ })).toBeInTheDocument();
		expect(screen.getByText("Confirmed")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Canvas Tote" })).toBeInTheDocument();
		expect(screen.getByText("$48")).toBeInTheDocument();
		expect(screen.getByText("Subtotal")).toBeInTheDocument();
		// Total row exists with the right value.
		const totalDt = screen.getByText("Total");
		expect(totalDt).toBeInTheDocument();
	});
});
