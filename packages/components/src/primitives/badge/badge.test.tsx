import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge.js";

describe("Badge", () => {
	it("renders its children", () => {
		render(<Badge>New</Badge>);
		expect(screen.getByText("New")).toBeInTheDocument();
	});

	it("applies the default variant class when no variant is passed", () => {
		render(<Badge>x</Badge>);
		expect(screen.getByText("x")).toHaveClass("bg-primary");
	});

	it("applies the secondary variant class", () => {
		render(<Badge variant="secondary">x</Badge>);
		expect(screen.getByText("x")).toHaveClass("bg-secondary");
	});

	it("applies the destructive variant class", () => {
		render(<Badge variant="destructive">x</Badge>);
		expect(screen.getByText("x")).toHaveClass("bg-destructive");
	});

	it("applies the outline variant class", () => {
		render(<Badge variant="outline">x</Badge>);
		const badge = screen.getByText("x");
		expect(badge).toHaveClass("text-foreground");
		expect(badge).not.toHaveClass("bg-primary");
	});

	it("merges consumer className with default classes", () => {
		render(<Badge className="custom-class">x</Badge>);
		const badge = screen.getByText("x");
		expect(badge).toHaveClass("custom-class");
		expect(badge).toHaveClass("rounded-full");
	});
});
