import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./toggle.js";

describe("Toggle", () => {
	it("renders an accessible button with aria-pressed", () => {
		render(<Toggle aria-label="Bold">B</Toggle>);
		const btn = screen.getByRole("button", { name: "Bold" });
		expect(btn).toBeInTheDocument();
		expect(btn).toHaveAttribute("aria-pressed", "false");
	});

	it("reflects defaultPressed on aria-pressed", () => {
		render(
			<Toggle aria-label="Bold" defaultPressed>
				B
			</Toggle>,
		);
		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
	});

	it("fires onPressedChange when clicked", async () => {
		const onPressedChange = vi.fn();
		render(
			<Toggle aria-label="Bold" onPressedChange={onPressedChange}>
				B
			</Toggle>,
		);
		await userEvent.click(screen.getByRole("button"));
		expect(onPressedChange).toHaveBeenCalledWith(true);
	});

	it("applies the outline variant class", () => {
		render(
			<Toggle aria-label="t" variant="outline">
				X
			</Toggle>,
		);
		expect(screen.getByRole("button")).toHaveClass("border-input");
	});

	it("applies the small size class", () => {
		render(
			<Toggle aria-label="t" size="sm">
				X
			</Toggle>,
		);
		expect(screen.getByRole("button").className).toMatch(
			/h-\[var\(--control-height-sm,2\.25rem\)\]/,
		);
	});

	it("does not fire onPressedChange when disabled", async () => {
		const onPressedChange = vi.fn();
		render(
			<Toggle aria-label="t" disabled onPressedChange={onPressedChange}>
				X
			</Toggle>,
		);
		const btn = screen.getByRole("button");
		expect(btn).toBeDisabled();
		await userEvent.click(btn);
		expect(onPressedChange).not.toHaveBeenCalled();
	});

	it("forwards ref to the underlying button element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLButtonElement | null>;
		render(
			<Toggle aria-label="t" ref={ref}>
				X
			</Toggle>,
		);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});
});
