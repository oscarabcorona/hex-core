import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChainOfThought } from "./chain-of-thought.js";

const STEPS = [
	{
		thought: "Need to look up the auth module",
		action: "read auth.ts",
		observation: "200 lines, uses bcrypt + jwt",
	},
	{ thought: "The bug is on line 42." },
];

describe("ChainOfThought — structure", () => {
	it("defaults the trace to collapsed", () => {
		render(<ChainOfThought steps={STEPS} />);
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
	});

	it("renders the trace open when defaultOpen is true", () => {
		render(<ChainOfThought steps={STEPS} defaultOpen />);
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText(/look up the auth module/i)).toBeInTheDocument();
	});

	it("renders one li per step with the term labels", () => {
		render(<ChainOfThought steps={STEPS} defaultOpen />);
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getAllByText(/^thought$/i)).toHaveLength(2);
		// Only step 1 has action + observation.
		expect(screen.getAllByText(/^action$/i)).toHaveLength(1);
		expect(screen.getAllByText(/^observation$/i)).toHaveLength(1);
	});

	it("uses the custom label on the collapsible header", () => {
		render(<ChainOfThought steps={STEPS} label="My reasoning" />);
		expect(screen.getByRole("button", { name: /my reasoning/i })).toBeInTheDocument();
	});
});

describe("ChainOfThought — final answer", () => {
	it("renders the final answer outside the collapsible (visible by default)", () => {
		render(
			<ChainOfThought
				steps={STEPS}
				finalAnswer={<p data-testid="final">Use bcrypt.hash(pw, 12).</p>}
			/>,
		);
		expect(screen.getByTestId("final")).toBeVisible();
	});

	it("does not render a final answer slot when prop is absent", () => {
		render(<ChainOfThought steps={STEPS} />);
		// Only the collapsible trigger button — no extra blocks.
		expect(screen.queryByTestId("final")).toBeNull();
	});
});

describe("ChainOfThought — interaction", () => {
	it("toggles the trace open on trigger click", async () => {
		const user = userEvent.setup();
		render(<ChainOfThought steps={STEPS} />);
		const trigger = screen.getByRole("button");
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
	});
});
