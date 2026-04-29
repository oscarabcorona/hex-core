import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DemoSurface } from "./demo-surface.js";

describe("DemoSurface", () => {
	it("renders its children", () => {
		render(
			<DemoSurface>
				<button type="button">demo button</button>
			</DemoSurface>,
		);
		expect(screen.getByRole("button", { name: "demo button" })).toBeInTheDocument();
	});

	it("applies the elevated-surface default classes", () => {
		render(<DemoSurface data-testid="root">x</DemoSurface>);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("rounded-lg");
		expect(root).toHaveClass("bg-muted/30");
	});

	it("applies the default minHeight of 200px via inline style", () => {
		render(<DemoSurface data-testid="root">x</DemoSurface>);
		expect(screen.getByTestId("root").style.minHeight).toBe("200px");
	});

	it("respects a custom minHeight", () => {
		render(
			<DemoSurface data-testid="root" minHeight="320px">
				x
			</DemoSurface>,
		);
		expect(screen.getByTestId("root").style.minHeight).toBe("320px");
	});

	it("merges consumer style with the inline minHeight", () => {
		render(
			<DemoSurface data-testid="root" style={{ background: "red" }}>
				x
			</DemoSurface>,
		);
		const root = screen.getByTestId("root");
		expect(root.style.minHeight).toBe("200px");
		expect(root.style.background).toBe("red");
	});

	it("merges consumer className with default classes", () => {
		render(
			<DemoSurface className="custom-class" data-testid="root">
				x
			</DemoSurface>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveClass("custom-class");
		expect(root).toHaveClass("rounded-lg");
	});

	it("forwards ref to the underlying div element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(<DemoSurface ref={ref}>x</DemoSurface>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("passes through arbitrary HTML props (id, aria-*, data-*)", () => {
		render(
			<DemoSurface
				id="surface-1"
				aria-label="component playground"
				data-testid="root"
			>
				x
			</DemoSurface>,
		);
		const root = screen.getByTestId("root");
		expect(root).toHaveAttribute("id", "surface-1");
		expect(root).toHaveAttribute("aria-label", "component playground");
	});
});
