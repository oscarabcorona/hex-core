import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox.js";

describe("Checkbox", () => {
	it("renders an accessible checkbox role", () => {
		render(<Checkbox aria-label="Accept terms" />);
		expect(screen.getByRole("checkbox", { name: "Accept terms" })).toBeInTheDocument();
	});

	it("starts unchecked by default", () => {
		render(<Checkbox aria-label="t" />);
		expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
	});

	it("reflects defaultChecked on the aria-checked attribute", () => {
		render(<Checkbox aria-label="t" defaultChecked />);
		expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
	});

	it("fires onCheckedChange when clicked", async () => {
		const onCheckedChange = vi.fn();
		render(<Checkbox aria-label="t" onCheckedChange={onCheckedChange} />);
		await userEvent.click(screen.getByRole("checkbox"));
		expect(onCheckedChange).toHaveBeenCalledWith(true);
	});

	it("does not fire onCheckedChange when disabled", async () => {
		const onCheckedChange = vi.fn();
		render(<Checkbox aria-label="t" disabled onCheckedChange={onCheckedChange} />);
		const cb = screen.getByRole("checkbox");
		expect(cb).toBeDisabled();
		await userEvent.click(cb);
		expect(onCheckedChange).not.toHaveBeenCalled();
	});

	it("merges consumer className with the default classes", () => {
		render(<Checkbox aria-label="t" className="custom-class" />);
		const cb = screen.getByRole("checkbox");
		expect(cb).toHaveClass("custom-class");
		expect(cb).toHaveClass("border-input");
	});

	it("forwards ref to the underlying button element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLButtonElement | null>;
		render(<Checkbox aria-label="t" ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("supports indeterminate state via the checked prop", () => {
		render(<Checkbox aria-label="t" checked="indeterminate" onCheckedChange={() => {}} />);
		expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
	});
});
