import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton.js";

describe("Skeleton", () => {
	it("renders a div with the pulse animation class", () => {
		render(<Skeleton data-testid="sk" />);
		const sk = screen.getByTestId("sk");
		expect(sk).toBeInstanceOf(HTMLDivElement);
		expect(sk).toHaveClass("animate-pulse");
	});

	it("merges consumer className with default classes", () => {
		render(<Skeleton className="h-12 w-12 custom-class" data-testid="sk" />);
		const sk = screen.getByTestId("sk");
		expect(sk).toHaveClass("custom-class");
		expect(sk).toHaveClass("rounded-md");
		expect(sk).toHaveClass("h-12");
	});

	it("passes through arbitrary HTML props", () => {
		render(<Skeleton role="presentation" aria-label="loading" data-testid="sk" />);
		const sk = screen.getByTestId("sk");
		expect(sk).toHaveAttribute("role", "presentation");
		expect(sk).toHaveAttribute("aria-label", "loading");
	});
});
