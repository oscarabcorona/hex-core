import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceProductFeatures } from "./commerce-product-features.js";

const FEATURES = [
	{ title: "Heavyweight canvas", description: "16 oz natural canvas." },
	{ title: "Reinforced handles", description: "Bar-tacked at stress points." },
];

describe("CommerceProductFeatures", () => {
	it("renders each feature title (h3) + description in alternating layout", () => {
		render(
			<CommerceProductFeatures title="Why this tote earns its keep" features={FEATURES} />,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Why this tote earns its keep" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Heavyweight canvas" })).toBeInTheDocument();
		expect(screen.getByText("16 oz natural canvas.")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Reinforced handles" })).toBeInTheDocument();
	});

	it("renders the grid variant", () => {
		render(<CommerceProductFeatures variant="grid" features={FEATURES} />);
		expect(screen.getByRole("heading", { level: 3, name: "Heavyweight canvas" })).toBeInTheDocument();
	});
});
