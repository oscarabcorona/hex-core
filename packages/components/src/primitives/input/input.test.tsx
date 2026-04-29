import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input.js";

describe("Input", () => {
	it("renders a textbox findable by its placeholder", () => {
		render(<Input placeholder="Email" />);
		expect(screen.getByRole("textbox")).toBe(screen.getByPlaceholderText("Email"));
	});

	it("respects the type prop", () => {
		render(<Input placeholder="Pwd" type="password" />);
		// password inputs are not exposed as role=textbox; query by placeholder
		const input = screen.getByPlaceholderText("Pwd");
		expect(input).toHaveAttribute("type", "password");
	});

	it("fires onChange while the user types", async () => {
		const onChange = vi.fn();
		render(<Input placeholder="t" onChange={onChange} />);
		await userEvent.type(screen.getByPlaceholderText("t"), "abc");
		expect(onChange).toHaveBeenCalledTimes(3);
	});

	it("does not fire onChange when disabled", async () => {
		const onChange = vi.fn();
		render(<Input placeholder="t" disabled onChange={onChange} />);
		const input = screen.getByPlaceholderText("t");
		expect(input).toBeDisabled();
		await userEvent.type(input, "abc");
		expect(onChange).not.toHaveBeenCalled();
	});

	it("merges consumer className with default classes", () => {
		render(<Input placeholder="t" className="custom-class" />);
		const input = screen.getByPlaceholderText("t");
		expect(input).toHaveClass("custom-class");
		expect(input).toHaveClass("rounded-md");
	});

	it("forwards ref to the underlying input element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLInputElement | null>;
		render(<Input placeholder="t" ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});
});
