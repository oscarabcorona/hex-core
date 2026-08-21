import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group.js";

describe("ToggleGroup (single)", () => {
	it("renders a group with each item as an accessible radio", () => {
		render(
			<ToggleGroup type="single" aria-label="Align">
				<ToggleGroupItem value="left" aria-label="Left">
					L
				</ToggleGroupItem>
				<ToggleGroupItem value="center" aria-label="Center">
					C
				</ToggleGroupItem>
			</ToggleGroup>,
		);
		// Radix Toggle Group v1.1.13+ exposes a single-select group as
		// role="radiogroup" with role="radio" items (more correct a11y semantics).
		expect(screen.getByRole("radiogroup", { name: "Align" })).toBeInTheDocument();
		expect(screen.getAllByRole("radio")).toHaveLength(2);
	});

	it("fires onValueChange with the clicked item's value", async () => {
		const onValueChange = vi.fn();
		render(
			<ToggleGroup type="single" aria-label="t" onValueChange={onValueChange}>
				<ToggleGroupItem value="left" aria-label="Left">
					L
				</ToggleGroupItem>
				<ToggleGroupItem value="center" aria-label="Center">
					C
				</ToggleGroupItem>
			</ToggleGroup>,
		);
		await userEvent.click(screen.getByRole("radio", { name: "Center" }));
		expect(onValueChange).toHaveBeenCalledWith("center");
	});
});

describe("ToggleGroup (multiple)", () => {
	it("renders items with aria-pressed for multi-select", () => {
		render(
			<ToggleGroup type="multiple" aria-label="t">
				<ToggleGroupItem value="b" aria-label="Bold">
					B
				</ToggleGroupItem>
				<ToggleGroupItem value="i" aria-label="Italic">
					I
				</ToggleGroupItem>
			</ToggleGroup>,
		);
		// multiple mode renders buttons (toggle-buttons) with aria-pressed
		const items = screen.getAllByRole("button");
		expect(items).toHaveLength(2);
		items.forEach((item) => expect(item).toHaveAttribute("aria-pressed", "false"));
	});

	it("inherits variant from the group context", () => {
		render(
			<ToggleGroup type="multiple" variant="outline" aria-label="t">
				<ToggleGroupItem value="b" aria-label="Bold">
					B
				</ToggleGroupItem>
			</ToggleGroup>,
		);
		expect(screen.getByRole("button", { name: "Bold" })).toHaveClass("border-input");
	});
});

describe("ToggleGroupItem", () => {
	it("forwards ref to the underlying button element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLButtonElement | null>;
		render(
			<ToggleGroup type="single" aria-label="t">
				<ToggleGroupItem value="x" aria-label="x" ref={ref}>
					X
				</ToggleGroupItem>
			</ToggleGroup>,
		);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});
});
