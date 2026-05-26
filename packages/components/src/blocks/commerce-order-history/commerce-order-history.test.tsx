import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceOrderHistory } from "./commerce-order-history.js";

const ORDERS = [
	{ id: "#1042", date: "May 23", total: "$104", status: <span>Confirmed</span>, href: "/orders/1042" },
	{ id: "#1037", date: "May 12", total: "$76", status: <span>Delivered</span> },
];

describe("CommerceOrderHistory", () => {
	it("renders a semantic table with order rows + View link only when href is set", () => {
		render(<CommerceOrderHistory title="Order history" orders={ORDERS} />);
		expect(screen.getByRole("heading", { level: 2, name: "Order history" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Order" })).toBeInTheDocument();
		expect(screen.getByRole("cell", { name: "#1042" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /View.*order #1042/ })).toHaveAttribute("href", "/orders/1042");
		// No link for the second row (no href).
		expect(screen.queryByRole("link", { name: /order #1037/ })).not.toBeInTheDocument();
	});

	it("renders the default empty state when orders is []", () => {
		render(<CommerceOrderHistory orders={[]} />);
		expect(screen.getByText("No orders yet.")).toBeInTheDocument();
	});
});
