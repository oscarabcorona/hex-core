import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Task } from "./task.js";

const STEPS_RUNNING = [
	{ id: "a", label: "Plan", state: "result" as const },
	{ id: "b", label: "Apply", state: "running" as const },
	{ id: "c", label: "Verify", state: "pending" as const },
];

describe("Task — header", () => {
	it("renders the optional label and step counter", () => {
		render(<Task label="Refactor auth" steps={STEPS_RUNNING} />);
		expect(screen.getByText("Refactor auth")).toBeInTheDocument();
		expect(screen.getByText(/1 of 3 steps/i)).toBeInTheDocument();
	});

	it("renders 'Done in X.Xs' when all steps are result and durationMs is set", () => {
		const done = STEPS_RUNNING.map((s) => ({ ...s, state: "result" as const }));
		render(<Task steps={done} durationMs={4200} />);
		expect(screen.getByText(/done in 4\.2s/i)).toBeInTheDocument();
	});

	it("renders 'failed' summary when any step is error", () => {
		const errored = [
			{ id: "a", label: "Plan", state: "result" as const },
			{ id: "b", label: "Apply", state: "error" as const },
			{ id: "c", label: "Verify", state: "pending" as const },
		];
		render(<Task steps={errored} />);
		expect(screen.getByText(/failed/i)).toBeInTheDocument();
	});

	it("omits the label row when label prop is not provided", () => {
		render(<Task steps={STEPS_RUNNING} />);
		// The summary "1 of 3 steps" shows up; no other heading-like text.
		expect(screen.queryByText("Refactor auth")).toBeNull();
	});
});

describe("Task — step rendering", () => {
	it("renders one li per step with the correct icon aria-label", () => {
		render(<Task steps={STEPS_RUNNING} />);
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		// Icons surface their state name via aria-label.
		expect(screen.getByRole("img", { name: /done/i })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /running/i })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /pending/i })).toBeInTheDocument();
	});

	it("renders an optional detail line under the step label", () => {
		const steps = [
			{
				id: "plan",
				label: "Plan migration",
				state: "result" as const,
				detail: "Identified 4 tables, 2 with existing indexes.",
			},
		];
		render(<Task steps={steps} />);
		expect(screen.getByText("Plan migration")).toBeInTheDocument();
		expect(screen.getByText(/identified 4 tables/i)).toBeInTheDocument();
	});
});

describe("Task — collapsible", () => {
	it("hides the step list when defaultOpen is false", () => {
		render(<Task steps={STEPS_RUNNING} defaultOpen={false} />);
		// Public contract: aria-expanded reflects collapsed state.
		expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
	});

	it("toggles open/closed on trigger click", async () => {
		const user = userEvent.setup();
		render(<Task steps={STEPS_RUNNING} defaultOpen={false} />);
		const trigger = screen.getByRole("button");
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
	});
});
