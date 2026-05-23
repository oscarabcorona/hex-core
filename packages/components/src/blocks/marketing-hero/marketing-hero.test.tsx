import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingHero } from "./marketing-hero.js";

describe("MarketingHero", () => {
	it("renders the title as the page <h1>", () => {
		render(<MarketingHero title="Ship faster" />);
		expect(screen.getByRole("heading", { level: 1, name: "Ship faster" })).toBeInTheDocument();
	});

	it("renders eyebrow, description, and actions when provided", () => {
		render(
			<MarketingHero
				title="T"
				eyebrow="New"
				description="Subcopy"
				actions={<button type="button">Go</button>}
			/>,
		);
		expect(screen.getByText("New")).toBeInTheDocument();
		expect(screen.getByText("Subcopy")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
	});

	it("renders media in split layout", () => {
		render(<MarketingHero title="T" layout="split" media={<img alt="shot" src="/x.png" />} />);
		expect(screen.getByAltText("shot")).toBeInTheDocument();
	});
});
