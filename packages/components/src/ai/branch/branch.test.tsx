import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Branch } from "./branch.js";

describe("Branch — chip", () => {
	it("renders 'N of M' for the active branch", () => {
		render(
			<Branch current={1} total={3}>
				<p>Body</p>
			</Branch>,
		);
		expect(screen.getByText("2 of 3")).toBeInTheDocument();
	});

	it("renders the body once (only the active branch)", () => {
		render(
			<Branch current={0} total={2} onCurrentChange={() => undefined}>
				<p data-testid="body">Active</p>
			</Branch>,
		);
		expect(screen.getAllByTestId("body")).toHaveLength(1);
	});

	it("labels the navigator landmark", () => {
		render(
			<Branch current={0} total={2} aria-label="Alt responses">
				<p>Body</p>
			</Branch>,
		);
		expect(screen.getByRole("group", { name: "Alt responses" })).toBeInTheDocument();
	});

	it("renders nothing when total === 0 (no nonsensical '1 of 0' chip)", () => {
		const { container } = render(
			<Branch current={0} total={0}>
				<p>Body</p>
			</Branch>,
		);
		expect(container.firstChild).toBeNull();
	});

	it("does not emit aria-atomic on read-only mount (mirrors aria-live gating)", () => {
		render(
			<Branch current={0} total={2}>
				<p>Body</p>
			</Branch>,
		);
		const chip = screen.getByText("1 of 2");
		expect(chip.getAttribute("aria-atomic")).toBeNull();
		expect(chip.getAttribute("aria-live")).toBeNull();
	});

	it("emits aria-atomic + aria-live on interactive mount", () => {
		render(
			<Branch current={0} total={2} onCurrentChange={() => undefined}>
				<p>Body</p>
			</Branch>,
		);
		const chip = screen.getByText("1 of 2");
		expect(chip.getAttribute("aria-atomic")).toBe("true");
		expect(chip.getAttribute("aria-live")).toBe("polite");
	});
});

describe("Branch — controls", () => {
	it("disables prev at first branch and next at last", () => {
		const noop = () => undefined;
		const { rerender } = render(
			<Branch current={0} total={3} onCurrentChange={noop}>
				<p>Body</p>
			</Branch>,
		);
		expect(screen.getByRole("button", { name: /previous response/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /next response/i })).not.toBeDisabled();

		rerender(
			<Branch current={2} total={3} onCurrentChange={noop}>
				<p>Body</p>
			</Branch>,
		);
		expect(screen.getByRole("button", { name: /previous response/i })).not.toBeDisabled();
		expect(screen.getByRole("button", { name: /next response/i })).toBeDisabled();
	});

	it("disables both controls when onCurrentChange is omitted (read-only)", () => {
		render(
			<Branch current={0} total={3}>
				<p>Body</p>
			</Branch>,
		);
		expect(screen.getByRole("button", { name: /previous response/i })).toBeDisabled();
		expect(screen.getByRole("button", { name: /next response/i })).toBeDisabled();
	});

	it("calls onCurrentChange with the next index on click", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<Branch current={1} total={3} onCurrentChange={onChange}>
				<p>Body</p>
			</Branch>,
		);
		await user.click(screen.getByRole("button", { name: /next response/i }));
		expect(onChange).toHaveBeenCalledWith(2);
		await user.click(screen.getByRole("button", { name: /previous response/i }));
		expect(onChange).toHaveBeenLastCalledWith(0);
	});

	it("steps via ArrowLeft / ArrowRight when focused inside the group", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<Branch current={1} total={3} onCurrentChange={onChange}>
				<p>Body</p>
			</Branch>,
		);
		const group = screen.getByRole("group");
		group.focus();
		// jsdom doesn't focus the div, so dispatch via the inner button instead.
		const next = screen.getByRole("button", { name: /next response/i });
		next.focus();
		await user.keyboard("{ArrowRight}");
		expect(onChange).toHaveBeenLastCalledWith(2);
		await user.keyboard("{ArrowLeft}");
		expect(onChange).toHaveBeenLastCalledWith(0);
	});

	it("does not invoke onCurrentChange when ArrowLeft/Right are pressed at boundaries", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<Branch current={0} total={2} onCurrentChange={onChange}>
				<p>Body</p>
			</Branch>,
		);
		screen.getByRole("button", { name: /next response/i }).focus();
		await user.keyboard("{ArrowLeft}");
		expect(onChange).not.toHaveBeenCalled();
	});
});
