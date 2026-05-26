import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingNewsletter } from "./marketing-newsletter.js";

describe("MarketingNewsletter", () => {
	it("renders title/description/form/disclaimer in centered layout", () => {
		render(
			<MarketingNewsletter
				title="Stay in the loop"
				description="One short email a month."
				form={
					<form aria-label="Newsletter signup">
						<input aria-label="Email" type="email" />
						<button type="submit">Subscribe</button>
					</form>
				}
				disclaimer="No spam."
			/>,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Stay in the loop" })).toBeInTheDocument();
		expect(screen.getByText("One short email a month.")).toBeInTheDocument();
		expect(screen.getByRole("form", { name: "Newsletter signup" })).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByText("No spam.")).toBeInTheDocument();
	});

	it("renders the split layout", () => {
		render(<MarketingNewsletter layout="split" title="Subscribe" form={<form aria-label="Form" />} />);
		expect(screen.getByRole("heading", { level: 2, name: "Subscribe" })).toBeInTheDocument();
	});
});
