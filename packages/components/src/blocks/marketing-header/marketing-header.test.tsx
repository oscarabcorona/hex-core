import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MarketingHeader } from "./marketing-header.js";

const LINKS = [
	{ label: "Features", href: "#features" },
	{ label: "Pricing", href: "#pricing" },
];

describe("MarketingHeader", () => {
	it("renders the logo and nav links", () => {
		render(<MarketingHeader logo={<span>Acme</span>} links={LINKS} />);
		expect(screen.getByText("Acme")).toBeInTheDocument();
		// "Features" appears in both the desktop list and (when open) the mobile panel;
		// closed, only the desktop anchor is present.
		expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute("href", "#features");
	});

	it("toggles the mobile panel and flips the toggle's aria state + label", async () => {
		const user = userEvent.setup();
		render(<MarketingHeader logo={<span>Acme</span>} links={LINKS} />);
		const toggle = screen.getByRole("button", { name: "Open menu" });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		await user.click(toggle);
		const open = screen.getByRole("button", { name: "Close menu" });
		expect(open).toHaveAttribute("aria-expanded", "true");
		// Both desktop + mobile copies of the link now exist.
		expect(screen.getAllByRole("link", { name: "Features" })).toHaveLength(2);
	});
});
