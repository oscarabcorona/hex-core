import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceCheckout } from "./commerce-checkout.js";

describe("CommerceCheckout", () => {
	it("renders the title as <h1>, the form, and a labelled summary aside", () => {
		render(
			<CommerceCheckout title="Checkout" summary={<div>Total $110</div>}>
				<form aria-label="Checkout form">
					<input aria-label="Email" type="email" />
				</form>
			</CommerceCheckout>,
		);
		expect(screen.getByRole("heading", { level: 1, name: "Checkout" })).toBeInTheDocument();
		expect(screen.getByRole("form", { name: "Checkout form" })).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		// Order summary lives in a labelled complementary region.
		expect(screen.getByRole("complementary", { name: "Order summary" })).toBeInTheDocument();
		expect(screen.getByText("Total $110")).toBeInTheDocument();
	});
});
