import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommercePromo } from "./commerce-promo.js";

describe("CommercePromo", () => {
	it("renders title (h2), description, actions, and media in image-right (default)", () => {
		render(
			<CommercePromo
				title="Summer collection — 20% off"
				description="Limited time."
				actions={<button type="button">Shop</button>}
				media={<img alt="Summer totes" src="/summer.jpg" />}
			/>,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Summer collection — 20% off" })).toBeInTheDocument();
		expect(screen.getByText("Limited time.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Shop" })).toBeInTheDocument();
		expect(screen.getByAltText("Summer totes")).toBeInTheDocument();
	});

	it("renders the overlay variant", () => {
		render(<CommercePromo variant="overlay" title="Sale" media={<img alt="bg" src="/bg.jpg" />} />);
		expect(screen.getByRole("heading", { level: 2, name: "Sale" })).toBeInTheDocument();
	});
});
