import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MarketingFaq } from "./marketing-faq.js";

const ITEMS = [
	{ question: "Can I switch plans?", answer: "Yes — prorated to the day." },
	{ question: "Free trial?", answer: "14 days, no card." },
];

describe("MarketingFaq", () => {
	it("renders each question as an accordion trigger and the heading as <h2>", () => {
		render(<MarketingFaq title="FAQ" items={ITEMS} />);
		expect(screen.getByRole("heading", { level: 2, name: "FAQ" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Can I switch plans?" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Free trial?" })).toBeInTheDocument();
	});

	it("toggles the answer on click (single, collapsible)", async () => {
		const user = userEvent.setup();
		render(<MarketingFaq items={ITEMS} />);
		const trigger = screen.getByRole("button", { name: "Can I switch plans?" });
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("Yes — prorated to the day.")).toBeInTheDocument();
	});
});
