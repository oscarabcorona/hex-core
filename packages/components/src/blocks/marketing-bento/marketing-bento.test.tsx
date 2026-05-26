import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingBento } from "./marketing-bento.js";

describe("MarketingBento", () => {
	it("renders heading + each tile title and description", () => {
		render(
			<MarketingBento
				title="Gallery"
				tiles={[
					{ title: "Hero feature", description: "Big tile.", span: "lg" },
					{ title: "Side feature", description: "Smaller tile." },
				]}
			/>,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Gallery" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Hero feature" })).toBeInTheDocument();
		expect(screen.getByText("Big tile.")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Side feature" })).toBeInTheDocument();
	});
});
