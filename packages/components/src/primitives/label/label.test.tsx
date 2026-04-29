import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label.js";

describe("Label", () => {
	it("renders its children as text content", () => {
		render(<Label>Email address</Label>);
		expect(screen.getByText("Email address")).toBeInTheDocument();
	});

	it("associates with a control via htmlFor", () => {
		render(
			<>
				<Label htmlFor="email-input">Email</Label>
				<input id="email-input" />
			</>,
		);
		expect(screen.getByText("Email")).toHaveAttribute("for", "email-input");
	});

	it("merges consumer className with default classes", () => {
		render(<Label className="custom-class">Hello</Label>);
		const label = screen.getByText("Hello");
		expect(label).toHaveClass("custom-class");
		expect(label).toHaveClass("text-sm");
		expect(label).toHaveClass("font-medium");
	});

	it("forwards ref to the underlying label element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLLabelElement | null>;
		render(<Label ref={ref}>Hello</Label>);
		expect(ref.current).toBeInstanceOf(HTMLLabelElement);
	});
});
