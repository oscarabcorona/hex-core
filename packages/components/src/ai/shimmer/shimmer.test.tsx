import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Shimmer } from "./shimmer.js";

describe("Shimmer — semantics", () => {
	it("renders a status region with the default 'Loading…' label", () => {
		render(<Shimmer />);
		const status = screen.getByRole("status");
		expect(status).toHaveAttribute("aria-label", "Loading…");
		expect(status).toHaveAttribute("aria-live", "polite");
	});

	it("uses a custom label when provided", () => {
		render(<Shimmer label="Generating response" />);
		expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Generating response");
	});
});

describe("Shimmer — sizing", () => {
	it("respects width and height props as inline styles", () => {
		render(<Shimmer width="80%" height="2rem" />);
		const status = screen.getByRole("status");
		expect(status.style.width).toBe("80%");
		expect(status.style.height).toBe("2rem");
	});

	it("merges a custom className alongside the default classes", () => {
		const { container } = render(<Shimmer className="my-shimmer" />);
		const status = container.querySelector('[role="status"]');
		expect(status?.className).toContain("my-shimmer");
		// Default classes still applied.
		expect(status?.className).toContain("bg-muted");
	});
});

describe("Shimmer — animation hook", () => {
	it("scales the pulse animation-duration via inline style", () => {
		const { container } = render(<Shimmer durationMs={2000} />);
		const status = container.querySelector('[role="status"]');
		expect(status).not.toBeNull();
		// The pulse keyframe cycle scales via animationDuration on the root.
		expect(status?.getAttribute("style") ?? "").toContain("2000ms");
	});

	it("applies the animate-pulse class for the loading effect", () => {
		const { container } = render(<Shimmer />);
		const status = container.querySelector('[role="status"]');
		expect(status?.className ?? "").toContain("animate-pulse");
	});
});
