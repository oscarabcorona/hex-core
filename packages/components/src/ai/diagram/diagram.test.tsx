import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Diagram } from "./diagram.js";

const renderMock = vi.fn();
const initializeMock = vi.fn();

vi.mock("mermaid", () => ({
	default: {
		initialize: (...args: unknown[]) => initializeMock(...args),
		render: (...args: unknown[]) => renderMock(...args),
	},
}));

describe("Diagram", () => {
	beforeEach(() => {
		renderMock.mockReset();
		initializeMock.mockReset();
	});

	it("renders the container with data-hex-diagram once mermaid resolves", async () => {
		renderMock.mockResolvedValue({ svg: "<svg data-mock-svg></svg>" });
		const { container } = render(<Diagram>{"flowchart LR\n  A --> B"}</Diagram>);
		await waitFor(() => {
			const el = container.querySelector("[data-hex-diagram]");
			expect(el?.innerHTML).toContain("data-mock-svg");
		});
	});

	it("forwards the theme attribute", async () => {
		renderMock.mockResolvedValue({ svg: "<svg/>" });
		const { container } = render(<Diagram theme="dark">{"graph TD; A-->B"}</Diagram>);
		await waitFor(() => {
			expect(container.querySelector("[data-hex-diagram]")).not.toBeNull();
		});
		expect(container.querySelector("[data-hex-diagram]")).toHaveAttribute("data-theme", "dark");
	});

	it("renders an error fallback and calls onError on parse failure", async () => {
		renderMock.mockRejectedValue(new Error("Parse error: unexpected token"));
		const onError = vi.fn();
		render(<Diagram onError={onError}>{"not valid mermaid"}</Diagram>);
		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeInTheDocument();
		});
		expect(screen.getByText("Diagram failed to render")).toBeInTheDocument();
		expect(screen.getByText(/Parse error/)).toBeInTheDocument();
		expect(onError).toHaveBeenCalledWith("Parse error: unexpected token");
	});

	it("initializes mermaid with strict securityLevel", async () => {
		renderMock.mockResolvedValue({ svg: "<svg/>" });
		render(<Diagram>{"flowchart LR; A-->B"}</Diagram>);
		await waitFor(() => expect(initializeMock).toHaveBeenCalled());
		const initCall = initializeMock.mock.calls[0][0] as { securityLevel: string };
		expect(initCall.securityLevel).toBe("strict");
	});

	it("uses the provided id, falling back to a generated one otherwise", async () => {
		renderMock.mockResolvedValue({ svg: "<svg/>" });
		render(<Diagram id="custom-id">{"graph TD; A-->B"}</Diagram>);
		await waitFor(() => expect(renderMock).toHaveBeenCalled());
		expect(renderMock.mock.calls[0][0]).toBe("custom-id");

		renderMock.mockClear();
		renderMock.mockResolvedValue({ svg: "<svg/>" });
		render(<Diagram>{"graph TD; A-->B"}</Diagram>);
		await waitFor(() => expect(renderMock).toHaveBeenCalled());
		// useId-derived ID with mermaid-incompatible chars stripped. Format
		// varies by React renderer (":r0:" in DOM, "_r_0_" in SSR/test).
		expect(renderMock.mock.calls[0][0]).toMatch(/^hex-diagram-[\w-]+$/);
	});
});
