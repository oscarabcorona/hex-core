import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingCta } from "./marketing-cta.js";

describe("MarketingCta", () => {
	it("renders the title as an <h2> with description and actions", () => {
		render(
			<MarketingCta
				title="Start today"
				description="Ship your first page in minutes."
				actions={<button type="button">Get started</button>}
			/>,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Start today" })).toBeInTheDocument();
		expect(screen.getByText("Ship your first page in minutes.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
	});

	it("renders the panel variant", () => {
		render(<MarketingCta variant="panel" title="Panel" />);
		expect(screen.getByRole("heading", { level: 2, name: "Panel" })).toBeInTheDocument();
	});
});
