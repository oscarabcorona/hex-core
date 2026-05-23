import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingFeatureGrid } from "./marketing-feature-grid.js";

const FEATURES = [
	{ title: "Fast", description: "Sub-second builds." },
	{ title: "Typed", description: "Strict end to end." },
];

describe("MarketingFeatureGrid", () => {
	it("renders the section heading and every feature", () => {
		render(<MarketingFeatureGrid title="Why us" features={FEATURES} />);
		expect(screen.getByRole("heading", { level: 2, name: "Why us" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Fast" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Typed" })).toBeInTheDocument();
		expect(screen.getByText("Sub-second builds.")).toBeInTheDocument();
	});

	it("renders without a heading block", () => {
		render(<MarketingFeatureGrid features={FEATURES} />);
		expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Fast" })).toBeInTheDocument();
	});
});
