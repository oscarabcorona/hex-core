import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select.js";

/*
 * Radix Select renders its content inside a portal triggered by pointer events
 * that jsdom doesn't fully implement (hasPointerCapture, getBoundingClientRect
 * geometry). These tests cover the trigger surface only — the parts that mount
 * synchronously without opening the popover.
 */

function renderSelect(
	props: Partial<React.ComponentProps<typeof Select>> = {},
): void {
	render(
		<Select {...props}>
			<SelectTrigger aria-label="Plan">
				<SelectValue placeholder="Pick a plan" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="free">Free</SelectItem>
				<SelectItem value="pro">Pro</SelectItem>
			</SelectContent>
		</Select>,
	);
}

describe("Select", () => {
	it("renders an accessible combobox trigger with the placeholder", () => {
		renderSelect();
		const trigger = screen.getByRole("combobox", { name: "Plan" });
		expect(trigger).toBeInTheDocument();
		expect(trigger).toHaveTextContent("Pick a plan");
	});

	it("shows the defaultValue label inside the trigger", () => {
		renderSelect({ defaultValue: "pro" });
		expect(screen.getByRole("combobox", { name: "Plan" })).toHaveTextContent("Pro");
	});

	it("disables the trigger when disabled", () => {
		render(
			<Select disabled>
				<SelectTrigger aria-label="t">
					<SelectValue placeholder="x" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="a">A</SelectItem>
				</SelectContent>
			</Select>,
		);
		expect(screen.getByRole("combobox")).toBeDisabled();
	});

	it("merges consumer className on the trigger", () => {
		render(
			<Select>
				<SelectTrigger aria-label="t" className="custom-class">
					<SelectValue placeholder="x" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="a">A</SelectItem>
				</SelectContent>
			</Select>,
		);
		const trigger = screen.getByRole("combobox");
		expect(trigger).toHaveClass("custom-class");
		expect(trigger).toHaveClass("rounded-md");
	});

	it("forwards SelectTrigger ref to its button element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLButtonElement | null>;
		render(
			<Select>
				<SelectTrigger aria-label="t" ref={ref}>
					<SelectValue placeholder="x" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="a">A</SelectItem>
				</SelectContent>
			</Select>,
		);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});
});
