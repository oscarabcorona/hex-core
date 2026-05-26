import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceIncentives } from "./commerce-incentives.js";

const INCENTIVES = [
	{ title: "Free shipping over $50", description: "On orders shipped within the US." },
	{ title: "30-day returns", description: "Easy returns, no questions asked." },
	{ title: "Secure checkout" },
];

describe("CommerceIncentives", () => {
	it("renders each incentive title (h3) + optional description", () => {
		render(<CommerceIncentives title="Why shop with us" incentives={INCENTIVES} />);
		expect(screen.getByRole("heading", { level: 2, name: "Why shop with us" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Free shipping over $50" })).toBeInTheDocument();
		expect(screen.getByText("On orders shipped within the US.")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Secure checkout" })).toBeInTheDocument();
	});
});
