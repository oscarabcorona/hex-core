import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Sources } from "./sources.js";

const SAMPLE = [
	{ title: "Auth research", url: "https://example.com/auth", page: 3 },
	{ title: "OAuth 2.1 spec", url: "https://oauth.net/2.1" },
];

describe("Sources — rendering", () => {
	it("renders an N-source header and one chip per source when open", () => {
		render(<Sources sources={SAMPLE} />);
		expect(screen.getByRole("button", { name: /2 sources/i })).toBeInTheDocument();
		// Both citations are visible with index labels [1] / [2].
		expect(screen.getByText(/auth research/i)).toBeInTheDocument();
		expect(screen.getByText(/oauth 2\.1 spec/i)).toBeInTheDocument();
	});

	it("uses singular wording for exactly one source", () => {
		render(<Sources sources={[SAMPLE[0]!]} />);
		expect(screen.getByRole("button", { name: /^1 source$/i })).toBeInTheDocument();
	});

	it("renders nothing when sources is empty", () => {
		const { container } = render(<Sources sources={[]} />);
		// Empty array → render-nothing: no panel, no button, nothing in DOM.
		expect(container.firstChild).toBeNull();
	});

	it("respects per-source index override (for non-1-based numbering)", () => {
		render(
			<Sources sources={[{ title: "Auth research", url: "https://example.com/auth", index: 5 }]} />,
		);
		// Citation renders the supplied index in its [N] label.
		expect(screen.getByText(/\[5\]/)).toBeInTheDocument();
	});
});

describe("Sources — collapsible behavior", () => {
	it("hides the citation list when defaultOpen is false", () => {
		render(<Sources sources={SAMPLE} defaultOpen={false} />);
		// Public contract: trigger reflects collapsed state via aria-expanded.
		expect(screen.getByRole("button", { name: /2 sources/i })).toHaveAttribute(
			"aria-expanded",
			"false",
		);
	});

	it("toggles open/closed on trigger click", async () => {
		const user = userEvent.setup();
		render(<Sources sources={SAMPLE} defaultOpen={false} />);
		const trigger = screen.getByRole("button", { name: /2 sources/i });
		expect(trigger).toHaveAttribute("aria-expanded", "false");

		await user.click(trigger);

		expect(trigger).toHaveAttribute("aria-expanded", "true");
	});
});

describe("Sources — Citation composition", () => {
	it("renders each source as a focusable anchor when url is provided", () => {
		render(<Sources sources={SAMPLE} />);
		const links = screen.getAllByRole("link");
		// Two URL-bearing sources → 2 anchors.
		expect(links).toHaveLength(2);
		expect(links[0]).toHaveAttribute("href", "https://example.com/auth");
		expect(links[1]).toHaveAttribute("href", "https://oauth.net/2.1");
	});

	it("renders the page suffix when source.page is set", () => {
		render(<Sources sources={SAMPLE} />);
		// Citation renders "p.3" for source[0].
		expect(screen.getByText(/p\.3/)).toBeInTheDocument();
	});
});
