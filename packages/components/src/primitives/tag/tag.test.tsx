import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./tag.js";

describe("Tag", () => {
	it("renders its children as the label", () => {
		render(<Tag>Urgent</Tag>);
		expect(screen.getByText("Urgent")).toBeInTheDocument();
	});

	it("does NOT render a close button when onRemove is undefined", () => {
		render(<Tag>Plain</Tag>);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("renders a close button with auto-derived aria-label when onRemove is provided", () => {
		render(<Tag onRemove={() => {}}>Urgent</Tag>);
		expect(screen.getByRole("button", { name: "Remove Urgent" })).toBeInTheDocument();
	});

	it("calls onRemove when the close button is clicked", async () => {
		const onRemove = vi.fn();
		render(<Tag onRemove={onRemove}>Urgent</Tag>);
		await userEvent.click(screen.getByRole("button", { name: "Remove Urgent" }));
		expect(onRemove).toHaveBeenCalledOnce();
	});

	it("respects a custom removeLabel", () => {
		render(
			<Tag onRemove={() => {}} removeLabel="Dismiss filter">
				Urgent
			</Tag>,
		);
		expect(screen.getByRole("button", { name: "Dismiss filter" })).toBeInTheDocument();
	});

	it("walks ReactNode children to extract string content for aria-label", () => {
		render(
			<Tag onRemove={() => {}}>
				<strong>Bold</strong>
			</Tag>,
		);
		expect(screen.getByRole("button", { name: "Remove Bold" })).toBeInTheDocument();
	});

	it("concatenates string leaves across mixed JSX children", () => {
		render(
			<Tag onRemove={() => {}}>
				<span>2 of</span> <em>5</em>
			</Tag>,
		);
		expect(screen.getByRole("button", { name: "Remove 2 of 5" })).toBeInTheDocument();
	});

	it("falls back to bare 'Remove' when no string content can be extracted", () => {
		render(
			<Tag onRemove={() => {}}>
				<svg aria-hidden="true" />
			</Tag>,
		);
		expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
	});

	it("applies variant classes (default / secondary / destructive / outline)", () => {
		const { container, rerender } = render(<Tag>x</Tag>);
		expect(container.firstChild).toHaveClass("bg-primary");

		rerender(<Tag variant="secondary">x</Tag>);
		expect(container.firstChild).toHaveClass("bg-secondary");

		rerender(<Tag variant="destructive">x</Tag>);
		expect(container.firstChild).toHaveClass("bg-destructive");

		rerender(<Tag variant="outline">x</Tag>);
		expect(container.firstChild).toHaveClass("border-foreground/20");
	});
});
