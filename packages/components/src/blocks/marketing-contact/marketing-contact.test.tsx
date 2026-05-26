import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingContact } from "./marketing-contact.js";

describe("MarketingContact", () => {
	it("renders heading + details + form in split layout", () => {
		render(
			<MarketingContact
				title="Get in touch"
				description="We'll reply within a day."
				details={<p>hello@acme.com</p>}
				form={
					<form aria-label="Contact">
						<input aria-label="Name" />
					</form>
				}
			/>,
		);
		expect(screen.getByRole("heading", { level: 2, name: "Get in touch" })).toBeInTheDocument();
		expect(screen.getByText("We'll reply within a day.")).toBeInTheDocument();
		expect(screen.getByText("hello@acme.com")).toBeInTheDocument();
		expect(screen.getByRole("form", { name: "Contact" })).toBeInTheDocument();
		expect(screen.getByLabelText("Name")).toBeInTheDocument();
	});

	it("renders the stacked layout", () => {
		render(<MarketingContact layout="stacked" title="Contact" form={<form aria-label="F" />} />);
		expect(screen.getByRole("heading", { level: 2, name: "Contact" })).toBeInTheDocument();
	});
});
