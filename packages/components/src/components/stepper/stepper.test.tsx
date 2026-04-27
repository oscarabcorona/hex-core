import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Stepper, type StepperStep } from "./stepper.js";

const baseSteps: StepperStep[] = [
	{ id: "a", label: "Account", description: "Email + password" },
	{ id: "b", label: "Profile" },
	{ id: "c", label: "Confirm" },
];

describe("Stepper", () => {
	it("renders an <ol> with the provided aria-label and one <li> per step", () => {
		render(<Stepper aria-label="Onboarding" current={0} steps={baseSteps} />);
		const list = screen.getByRole("list", { name: "Onboarding" });
		expect(list.tagName).toBe("OL");
		expect(list.querySelectorAll("li")).toHaveLength(baseSteps.length);
	});

	it("marks the current step with aria-current='step' on the <li> and prefixes earlier steps with 'Completed:'", () => {
		render(<Stepper aria-label="Onboarding" current={1} steps={baseSteps} />);
		const items = screen.getAllByRole("listitem");
		expect(items[0]).toHaveTextContent(/^Completed: Account/);
		// aria-current="step" is on the <li> itself (per WAI step-list guidance),
		// not on an inner span/button
		expect(items[1]).toHaveAttribute("aria-current", "step");
		expect(items[0]).not.toHaveAttribute("aria-current");
		expect(items[2]).not.toHaveAttribute("aria-current");
	});

	it("renders steps as non-interactive <span>s when onStepClick is omitted", () => {
		render(<Stepper aria-label="Onboarding" current={0} steps={baseSteps} />);
		// No <button> children inside the list when not interactive
		const list = screen.getByRole("list", { name: "Onboarding" });
		expect(list.querySelectorAll("button")).toHaveLength(0);
	});

	it("renders steps as <button>s when onStepClick is provided and fires it with the clicked index; disabled steps don't fire", async () => {
		const handle = vi.fn();
		render(
			<Stepper
				aria-label="Onboarding"
				current={1}
				onStepClick={handle}
				steps={[
					{ id: "a", label: "Account" },
					{ id: "b", label: "Profile" },
					{ id: "c", label: "Confirm", disabled: true },
				]}
			/>,
		);
		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(3);

		await userEvent.click(buttons[0]);
		expect(handle).toHaveBeenLastCalledWith(0);

		await userEvent.click(buttons[2]);
		// The third was disabled — count should still be 1
		expect(handle).toHaveBeenCalledTimes(1);
	});

	it("step.status='error' overrides the index-derived status and the indicator carries aria-invalid='true'", () => {
		render(
			<Stepper
				aria-label="Checkout"
				current={2}
				steps={[
					{ id: "cart", label: "Cart" },
					{ id: "shipping", label: "Shipping", status: "error" },
					{ id: "payment", label: "Payment" },
				]}
			/>,
		);
		const errorItem = screen.getAllByRole("listitem")[1];
		expect(errorItem).toHaveTextContent(/^Error: Shipping/);
		expect(
			errorItem.querySelector('[aria-invalid="true"]'),
		).not.toBeNull();
	});

	it("orientation='vertical' applies a flex-col root layout", () => {
		render(
			<Stepper
				aria-label="Settings"
				orientation="vertical"
				current={0}
				steps={baseSteps}
			/>,
		);
		const list = screen.getByRole("list", { name: "Settings" });
		expect(list.className).toMatch(/flex-col/);
	});

	it("connector after an error step does NOT render as complete (the milestone isn't cleared)", () => {
		const { container } = render(
			<Stepper
				aria-label="Checkout"
				current={2}
				steps={[
					{ id: "cart", label: "Cart" },
					{ id: "shipping", label: "Shipping", status: "error" },
					{ id: "payment", label: "Payment" },
				]}
			/>,
		);
		// Two connectors: after [0] cart, after [1] shipping. The cart one is
		// complete (cart < current=2, no error). The shipping one is NOT —
		// shipping carries status="error" so the gap to payment stays empty.
		const connectors = container.querySelectorAll('[aria-hidden="true"].bg-input, [aria-hidden="true"].bg-primary');
		expect(connectors).toHaveLength(2);
		// First connector (after cart, completed step) should be primary-colored
		expect(connectors[0].className).toContain("bg-primary");
		// Second connector (after error step) should remain bg-input
		expect(connectors[1].className).toContain("bg-input");
	});
});
