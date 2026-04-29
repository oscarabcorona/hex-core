import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch.js";

describe("Switch", () => {
	it("renders an accessible switch role", () => {
		render(<Switch aria-label="Enable notifications" />);
		expect(
			screen.getByRole("switch", { name: "Enable notifications" }),
		).toBeInTheDocument();
	});

	it("starts unchecked by default", () => {
		render(<Switch aria-label="t" />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
	});

	it("reflects defaultChecked on aria-checked", () => {
		render(<Switch aria-label="t" defaultChecked />);
		expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
	});

	it("fires onCheckedChange when toggled", async () => {
		const onCheckedChange = vi.fn();
		render(<Switch aria-label="t" onCheckedChange={onCheckedChange} />);
		await userEvent.click(screen.getByRole("switch"));
		expect(onCheckedChange).toHaveBeenCalledWith(true);
	});

	it("does not fire callbacks when disabled", async () => {
		const onCheckedChange = vi.fn();
		render(<Switch aria-label="t" disabled onCheckedChange={onCheckedChange} />);
		const sw = screen.getByRole("switch");
		expect(sw).toBeDisabled();
		await userEvent.click(sw);
		expect(onCheckedChange).not.toHaveBeenCalled();
	});

	it("merges consumer className with default classes", () => {
		render(<Switch aria-label="t" className="custom-class" />);
		const sw = screen.getByRole("switch");
		expect(sw).toHaveClass("custom-class");
		expect(sw).toHaveClass("rounded-full");
	});

	it("forwards ref to the underlying button element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLButtonElement | null>;
		render(<Switch aria-label="t" ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});
});
