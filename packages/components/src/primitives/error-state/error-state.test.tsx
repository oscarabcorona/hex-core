import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./error-state.js";

describe("ErrorState", () => {
	it("mounts with role='alert' so screen readers announce on first render", () => {
		render(<ErrorState message="Something failed." />);
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("renders the default title 'Something went wrong' when title is not provided", () => {
		render(<ErrorState message="Body" />);
		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("renders an explicit title when provided", () => {
		render(<ErrorState title="Couldn't load" message="Body" />);
		expect(screen.getByText("Couldn't load")).toBeInTheDocument();
	});

	it("renders the action slot when provided", () => {
		render(
			<ErrorState
				message="x"
				action={<button type="button">Retry</button>}
			/>,
		);
		expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
	});

	it("does NOT render the action area when action prop is omitted", () => {
		render(<ErrorState message="x" />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("invokes the action's click handler when clicked (consumer controls the button)", async () => {
		const onClick = vi.fn();
		render(
			<ErrorState
				message="x"
				action={
					<button type="button" onClick={onClick}>
						Retry
					</button>
				}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Retry" }));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("applies the destructive variant border class", () => {
		const { container } = render(
			<ErrorState variant="destructive" message="x" />,
		);
		expect(container.firstChild).toHaveClass("border-destructive/30");
	});
});
