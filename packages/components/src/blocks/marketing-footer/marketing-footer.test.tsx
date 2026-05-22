import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingFooter } from "./marketing-footer.js";

const COLUMNS = [
	{ title: "Product", links: [{ label: "Features", href: "#features" }] },
	{ title: "Company", links: [{ label: "About", href: "/about" }] },
];

describe("MarketingFooter", () => {
	it("renders column headings, links, brand, and copyright", () => {
		render(
			<MarketingFooter
				brand={<span>Acme</span>}
				columns={COLUMNS}
				copyright={<>© 2026 Acme</>}
			/>,
		);
		expect(screen.getByRole("heading", { level: 3, name: "Product" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Company" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
		expect(screen.getByText("Acme")).toBeInTheDocument();
		expect(screen.getByText(/© 2026 Acme/)).toBeInTheDocument();
	});

	it("omits the bottom bar when neither social nor copyright is given", () => {
		render(<MarketingFooter columns={COLUMNS} />);
		expect(screen.queryByText(/©/)).not.toBeInTheDocument();
	});
});
