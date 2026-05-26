import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CommerceStoreNav } from "./commerce-store-nav.js";

const CATEGORIES = [
	{ label: "New", href: "/c/new" },
	{ label: "Bags", href: "/c/bags" },
];

describe("CommerceStoreNav", () => {
	it("renders logo + categories + actions", () => {
		render(
			<CommerceStoreNav
				logo={<span>Shop</span>}
				categories={CATEGORIES}
				actions={<a href="/cart">Cart (2)</a>}
			/>,
		);
		expect(screen.getByText("Shop")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "New" })).toHaveAttribute("href", "/c/new");
		expect(screen.getByRole("link", { name: "Cart (2)" })).toBeInTheDocument();
	});

	it("toggles the mobile menu with the correct aria-expanded + label", async () => {
		const user = userEvent.setup();
		render(<CommerceStoreNav logo={<span>Shop</span>} categories={CATEGORIES} />);
		const toggle = screen.getByRole("button", { name: "Open menu" });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		await user.click(toggle);
		expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
	});
});
