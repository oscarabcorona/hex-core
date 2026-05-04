import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InlineCitation } from "./inline-citation.js";

describe("InlineCitation — rendering", () => {
	it("renders an anchor inside <sup> when url is provided", () => {
		const { container } = render(
			<InlineCitation
				index={1}
				title="Auth research"
				url="https://example.com/auth"
			/>,
		);
		const sup = container.querySelector("sup");
		expect(sup).not.toBeNull();
		const link = sup?.querySelector("a");
		expect(link).not.toBeNull();
		expect(link?.getAttribute("href")).toBe("https://example.com/auth");
		expect(link?.textContent).toBe("[1]");
	});

	it("renders a focusable button inside <sup> when url is omitted", () => {
		const { container } = render(<InlineCitation index={2} title="Internal RFC" />);
		const sup = container.querySelector("sup");
		expect(sup?.querySelector("a")).toBeNull();
		const button = sup?.querySelector("button");
		expect(button).not.toBeNull();
		expect(button?.getAttribute("type")).toBe("button");
		expect(button?.textContent).toBe("[2]");
		// Keyboard parity with the URL'd anchor: the button is in the tab order
		// and screen readers announce it with the source label.
		expect(button?.getAttribute("aria-label")).toBe("Source 2: Internal RFC");
	});

	it("exposes accessible label via aria-label on the trigger", () => {
		render(
			<InlineCitation
				index={3}
				title="OAuth 2.1 spec"
				url="https://oauth.net/2.1"
			/>,
		);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("aria-label", "Source 3: OAuth 2.1 spec");
	});

	it("doesn't render preview content in the DOM until hover (Radix HoverCard portal)", () => {
		const { container } = render(
			<InlineCitation
				index={1}
				title="Auth research"
				url="https://example.com/auth"
				excerpt="A study of OAuth flows."
			/>,
		);
		// Content is in a Portal, not mounted until trigger fires hover/focus.
		expect(container.textContent ?? "").not.toContain("A study of OAuth flows.");
	});
});
