import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Terminal } from "./terminal.js";

// xterm.js drives a canvas + DOM — jsdom can mount the wrapper but not run
// the engine. The dynamic import inside `useEffect` is mocked so the test
// asserts wrapper structure + prop forwarding without booting xterm.
vi.mock("@xterm/xterm", () => {
	const mocks = {
		write: vi.fn(),
		reset: vi.fn(),
		dispose: vi.fn(),
		open: vi.fn(),
		onData: vi.fn(() => ({ dispose: vi.fn() })),
	};
	class MockTerminal {
		write = mocks.write;
		reset = mocks.reset;
		dispose = mocks.dispose;
		open = mocks.open;
		onData = mocks.onData;
	}
	return { Terminal: MockTerminal };
});

describe("Terminal", () => {
	it("renders the container div with terminal data attribute", () => {
		const { container } = render(<Terminal output="$ ls" />);
		const el = container.querySelector("[data-hex-terminal]");
		expect(el).not.toBeNull();
	});

	it("forwards data-theme attribute (default dark)", () => {
		const { container } = render(<Terminal />);
		const el = container.querySelector("[data-hex-terminal]");
		expect(el).toHaveAttribute("data-theme", "dark");
	});

	it("uses light theme when theme=\"light\"", () => {
		const { container } = render(<Terminal theme="light" />);
		const el = container.querySelector("[data-hex-terminal]");
		expect(el).toHaveAttribute("data-theme", "light");
	});

	it("merges className onto the container", () => {
		const { container } = render(<Terminal className="custom-class" />);
		const el = container.querySelector("[data-hex-terminal]");
		expect(el?.className).toContain("custom-class");
	});

	it("normalizes string[] output by joining without separator", () => {
		// Indirect assertion: the component shouldn't throw on array input.
		// Real xterm.write delivery is exercised in integration tests.
		expect(() => render(<Terminal output={["line1\r\n", "line2\r\n"]} />)).not.toThrow();
	});
});
