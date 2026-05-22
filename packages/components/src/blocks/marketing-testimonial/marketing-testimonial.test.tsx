import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingTestimonial } from "./marketing-testimonial.js";

const ITEMS = [
	{ quote: "Cut our ship time in half.", authorName: "Jordan Lee", authorTitle: "Head of Design" },
	{ quote: "Our agents assemble pages now.", authorName: "Sam Patel", authorTitle: "CTO" },
];

describe("MarketingTestimonial", () => {
	it("single layout features only the first testimonial", () => {
		render(<MarketingTestimonial layout="single" testimonials={ITEMS} />);
		expect(screen.getByText("Cut our ship time in half.")).toBeInTheDocument();
		expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
		expect(screen.queryByText("Our agents assemble pages now.")).not.toBeInTheDocument();
	});

	it("grid layout renders every testimonial", () => {
		render(<MarketingTestimonial layout="grid" title="Loved by teams" testimonials={ITEMS} />);
		expect(screen.getByText("Cut our ship time in half.")).toBeInTheDocument();
		expect(screen.getByText("Our agents assemble pages now.")).toBeInTheDocument();
	});

	it("returns nothing when single layout has no testimonials", () => {
		const { container } = render(<MarketingTestimonial layout="single" testimonials={[]} />);
		expect(container).toBeEmptyDOMElement();
	});
});
