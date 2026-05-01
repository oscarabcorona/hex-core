import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Canvas } from "./canvas.js";

vi.mock("reactflow", () => ({
	ReactFlow: ({ children }: { children?: React.ReactNode }) => (
		<div data-mock-reactflow>{children}</div>
	),
	Background: () => <div data-mock-background />,
	Controls: () => <div data-mock-controls />,
}));

describe("Canvas", () => {
	it("renders a loading placeholder before reactflow resolves", () => {
		const { container } = render(<Canvas nodes={[]} edges={[]} />);
		// Synchronously after render the dynamic import hasn't resolved yet.
		expect(container.querySelector("[data-hex-canvas-loading]")).not.toBeNull();
	});

	it("renders the ReactFlow surface once the dynamic import resolves", async () => {
		const { container } = render(<Canvas nodes={[]} edges={[]} />);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-canvas]")).not.toBeNull();
		});
		expect(container.querySelector("[data-mock-reactflow]")).not.toBeNull();
	});

	it("renders Background + Controls by default", async () => {
		const { container } = render(<Canvas nodes={[]} edges={[]} />);
		await waitFor(() => {
			expect(container.querySelector("[data-mock-background]")).not.toBeNull();
		});
		expect(container.querySelector("[data-mock-controls]")).not.toBeNull();
	});

	it("hides Background + Controls when flagged", async () => {
		const { container } = render(
			<Canvas nodes={[]} edges={[]} hideBackground hideControls />,
		);
		await waitFor(() => {
			expect(container.querySelector("[data-mock-reactflow]")).not.toBeNull();
		});
		expect(container.querySelector("[data-mock-background]")).toBeNull();
		expect(container.querySelector("[data-mock-controls]")).toBeNull();
	});

	it("merges className onto the container", async () => {
		const { container } = render(
			<Canvas nodes={[]} edges={[]} className="custom-canvas" />,
		);
		await waitFor(() => {
			const el = container.querySelector("[data-hex-canvas]");
			expect(el?.className).toContain("custom-canvas");
		});
	});

	it("renders children inside ReactFlow", async () => {
		const { container } = render(
			<Canvas nodes={[]} edges={[]}>
				<div data-mini-map />
			</Canvas>,
		);
		await waitFor(() => {
			const rf = container.querySelector("[data-mock-reactflow]");
			expect(rf?.querySelector("[data-mini-map]")).not.toBeNull();
		});
	});
});
