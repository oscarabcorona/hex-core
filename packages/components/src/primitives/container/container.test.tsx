import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Container } from "./container.js";

describe("Container", () => {
	it("renders a div with mx-auto by default", () => {
		render(<Container data-testid="root">x</Container>);
		const root = screen.getByTestId("root");
		expect(root.tagName).toBe("DIV");
		expect(root).toHaveClass("mx-auto");
	});

	it("applies the default lg size + md padding variants", () => {
		render(<Container data-testid="root">x</Container>);
		const root = screen.getByTestId("root");
		expect(root.className).toMatch(/max-w-\[var\(--container-lg/);
		expect(root.className).toMatch(/px-\[var\(--space-4/);
	});

	it("applies the size variant", () => {
		render(
			<Container size="sm" data-testid="root">
				x
			</Container>,
		);
		expect(screen.getByTestId("root").className).toMatch(/max-w-\[var\(--container-sm/);
	});

	it("applies size='full' as max-w-full", () => {
		render(
			<Container size="full" data-testid="root">
				x
			</Container>,
		);
		expect(screen.getByTestId("root")).toHaveClass("max-w-full");
	});

	it("removes horizontal padding when padding='none'", () => {
		render(
			<Container padding="none" data-testid="root">
				x
			</Container>,
		);
		expect(screen.getByTestId("root").className).not.toMatch(/px-/);
	});

	it("renders as the child element when asChild is true", () => {
		render(
			<Container asChild>
				<main data-testid="root">x</main>
			</Container>,
		);
		const root = screen.getByTestId("root");
		expect(root.tagName).toBe("MAIN");
		expect(root).toHaveClass("mx-auto");
	});

	it("merges consumer className with default classes", () => {
		render(
			<Container className="custom-class" data-testid="root">
				x
			</Container>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("custom-class");
		expect(root).toHaveClass("mx-auto");
	});
});
