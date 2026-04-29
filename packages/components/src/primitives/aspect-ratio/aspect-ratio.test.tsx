import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AspectRatio } from "./aspect-ratio.js";

describe("AspectRatio", () => {
	it("renders its children", () => {
		render(
			<AspectRatio ratio={16 / 9}>
				<img src="x" alt="banner" />
			</AspectRatio>,
		);
		expect(screen.getByAltText("banner")).toBeInTheDocument();
	});

	it("applies the ratio via inline padding-bottom on the wrapper", () => {
		const { container } = render(
			<AspectRatio ratio={1}>
				<div data-testid="content" />
			</AspectRatio>,
		);
		// Radix sets paddingBottom: <100/ratio>% on the wrapper to preserve aspect-ratio.
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.paddingBottom).toBe("100%");
	});

	it("forwards arbitrary HTML props onto the inner element", () => {
		render(
			<AspectRatio ratio={1} data-testid="ar" aria-label="cover">
				<div />
			</AspectRatio>,
		);
		expect(screen.getByTestId("ar")).toHaveAttribute("aria-label", "cover");
	});
});
