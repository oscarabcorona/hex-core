import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./textarea.js";

describe("Textarea", () => {
	it("renders an accessible textbox findable by its placeholder", () => {
		render(<Textarea placeholder="Notes" />);
		expect(screen.getByRole("textbox")).toBe(screen.getByPlaceholderText("Notes"));
	});

	it("fires onChange while the user types", async () => {
		const onChange = vi.fn();
		render(<Textarea placeholder="t" onChange={onChange} />);
		await userEvent.type(screen.getByRole("textbox"), "ab");
		expect(onChange).toHaveBeenCalledTimes(2);
	});

	it("does not fire onChange when disabled", async () => {
		const onChange = vi.fn();
		render(<Textarea placeholder="t" disabled onChange={onChange} />);
		const ta = screen.getByRole("textbox");
		expect(ta).toBeDisabled();
		await userEvent.type(ta, "ab");
		expect(onChange).not.toHaveBeenCalled();
	});

	it("merges consumer className with default classes", () => {
		render(<Textarea placeholder="t" className="custom-class" />);
		const ta = screen.getByRole("textbox");
		expect(ta).toHaveClass("custom-class");
		expect(ta).toHaveClass("rounded-md");
	});

	it("forwards ref to the underlying textarea element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLTextAreaElement | null>;
		render(<Textarea placeholder="t" ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
	});
});
