import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Plan } from "./plan.js";

const STEPS = [
	{ id: "read", label: "Read existing auth" },
	{ id: "apply", label: "Apply changes" },
	{ id: "test", label: "Run tests", detail: "Unit + integration." },
];

describe("Plan — header", () => {
	it("renders the optional label and description", () => {
		render(<Plan label="Refactor auth" description="Three-step refactor." steps={STEPS} />);
		expect(screen.getByText("Refactor auth")).toBeInTheDocument();
		expect(screen.getByText("Three-step refactor.")).toBeInTheDocument();
	});

	it("omits the header section when label and description are absent", () => {
		render(<Plan steps={STEPS} />);
		expect(screen.queryByText("Refactor auth")).toBeNull();
	});
});

describe("Plan — step rendering", () => {
	it("renders one li per step with the label and optional detail", () => {
		render(<Plan steps={STEPS} />);
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(screen.getByText("Read existing auth")).toBeInTheDocument();
		expect(screen.getByText("Run tests")).toBeInTheDocument();
		expect(screen.getByText("Unit + integration.")).toBeInTheDocument();
	});

	it("labels the ordered list using the plan label", () => {
		render(<Plan label="Refactor auth" steps={STEPS} />);
		expect(screen.getByRole("list", { name: "Refactor auth steps" })).toBeInTheDocument();
	});

	it("falls back to a generic list label when no plan label is set", () => {
		render(<Plan steps={STEPS} />);
		expect(screen.getByRole("list", { name: "Plan steps" })).toBeInTheDocument();
	});
});

describe("Plan — approval gate", () => {
	it("renders no footer when neither onApprove nor onCancel is provided", () => {
		render(<Plan steps={STEPS} />);
		expect(screen.queryByRole("button")).toBeNull();
	});

	it("renders only the Approve button when onCancel is omitted", () => {
		render(<Plan steps={STEPS} onApprove={() => undefined} />);
		expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /cancel/i })).toBeNull();
	});

	it("renders only the Cancel button when onApprove is omitted", () => {
		render(<Plan steps={STEPS} onCancel={() => undefined} />);
		expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /approve/i })).toBeNull();
	});

	it("invokes onApprove / onCancel on click", async () => {
		const user = userEvent.setup();
		const onApprove = vi.fn();
		const onCancel = vi.fn();
		render(<Plan steps={STEPS} onApprove={onApprove} onCancel={onCancel} />);
		await user.click(screen.getByRole("button", { name: /approve/i }));
		expect(onApprove).toHaveBeenCalledOnce();
		await user.click(screen.getByRole("button", { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});

	it("respects approveLabel / cancelLabel overrides", () => {
		render(
			<Plan
				steps={STEPS}
				onApprove={() => undefined}
				onCancel={() => undefined}
				approveLabel="Run it"
				cancelLabel="Skip"
			/>,
		);
		expect(screen.getByRole("button", { name: "Run it" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
	});
});
