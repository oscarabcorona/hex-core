import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./radio-group.js";

function renderGroup(
	props: Partial<React.ComponentProps<typeof RadioGroup>> = {},
): void {
	render(
		<RadioGroup aria-label="Plan" {...props}>
			<RadioGroupItem value="free" aria-label="Free" />
			<RadioGroupItem value="pro" aria-label="Pro" />
		</RadioGroup>,
	);
}

describe("RadioGroup", () => {
	it("renders a radiogroup with each item as a radio", () => {
		renderGroup();
		expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
		expect(screen.getAllByRole("radio")).toHaveLength(2);
	});

	it("selects the item that matches defaultValue", () => {
		renderGroup({ defaultValue: "pro" });
		expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true");
		expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "false");
	});

	it("fires onValueChange when a different item is clicked", async () => {
		const onValueChange = vi.fn();
		render(
			<RadioGroup aria-label="Plan" onValueChange={onValueChange}>
				<RadioGroupItem value="free" aria-label="Free" />
				<RadioGroupItem value="pro" aria-label="Pro" />
			</RadioGroup>,
		);
		await userEvent.click(screen.getByRole("radio", { name: "Pro" }));
		expect(onValueChange).toHaveBeenCalledWith("pro");
	});

	it("does not fire onValueChange when an item is disabled", async () => {
		const onValueChange = vi.fn();
		render(
			<RadioGroup aria-label="Plan" onValueChange={onValueChange}>
				<RadioGroupItem value="free" aria-label="Free" />
				<RadioGroupItem value="pro" aria-label="Pro" disabled />
			</RadioGroup>,
		);
		const proItem = screen.getByRole("radio", { name: "Pro" });
		expect(proItem).toBeDisabled();
		await userEvent.click(proItem);
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("forwards ref to the underlying group element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
		render(
			<RadioGroup aria-label="Plan" ref={ref}>
				<RadioGroupItem value="free" aria-label="Free" />
			</RadioGroup>,
		);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});

describe("RadioGroupItem", () => {
	it("forwards ref to the underlying button element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLButtonElement | null>;
		render(
			<RadioGroup aria-label="t">
				<RadioGroupItem value="x" aria-label="x" ref={ref} />
			</RadioGroup>,
		);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("merges consumer className with default classes", () => {
		render(
			<RadioGroup aria-label="t">
				<RadioGroupItem value="x" aria-label="x" className="custom-class" />
			</RadioGroup>,
		);
		const item = screen.getByRole("radio");
		expect(item).toHaveClass("custom-class");
		expect(item).toHaveClass("border-input");
	});
});
