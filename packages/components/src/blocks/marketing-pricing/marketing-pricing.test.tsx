import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingPricing } from "./marketing-pricing.js";

const TIERS = [
	{ name: "Starter", price: "$0", features: ["1 project"], cta: <button type="button">Start</button> },
	{
		name: "Pro",
		price: "$29",
		highlighted: true,
		badge: <span>Popular</span>,
		features: ["Unlimited projects", "Analytics"],
		cta: <button type="button">Choose Pro</button>,
	},
];

describe("MarketingPricing", () => {
	it("renders each tier name, price, features, and CTA", () => {
		render(<MarketingPricing title="Pricing" tiers={TIERS} />);
		expect(screen.getByRole("heading", { level: 3, name: "Starter" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Pro" })).toBeInTheDocument();
		expect(screen.getByText("$29")).toBeInTheDocument();
		expect(screen.getByText("Unlimited projects")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Choose Pro" })).toBeInTheDocument();
	});

	it("renders the highlighted tier's badge", () => {
		render(<MarketingPricing tiers={TIERS} />);
		expect(screen.getByText("Popular")).toBeInTheDocument();
	});
});
