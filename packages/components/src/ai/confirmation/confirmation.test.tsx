import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Confirmation } from "./confirmation.js";

describe("Confirmation — basic flow", () => {
	it("renders the trigger and opens the dialog when clicked", async () => {
		const user = userEvent.setup();
		render(
			<Confirmation
				trigger={<button type="button">Delete</button>}
				title="Delete?"
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.queryByRole("alertdialog")).toBeNull();
		await user.click(screen.getByRole("button", { name: /delete/i }));
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByText("Delete?")).toBeInTheDocument();
	});

	it("closes the dialog after a sync onConfirm in uncontrolled mode", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		render(
			<Confirmation
				trigger={<button type="button">Open</button>}
				title="Continue?"
				onConfirm={onConfirm}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /open/i }));
		await user.click(screen.getByRole("button", { name: /continue/i }));
		expect(onConfirm).toHaveBeenCalledOnce();
		// Radix removes the dialog from the DOM on close.
		expect(screen.queryByRole("alertdialog")).toBeNull();
	});

	it("invokes onConfirm when the confirm button is clicked", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="Continue?"
				onConfirm={onConfirm}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /continue/i }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it("invokes onCancel when the cancel button is clicked", async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="Continue?"
				onConfirm={() => undefined}
				onCancel={onCancel}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalledOnce();
	});
});

describe("Confirmation — severity", () => {
	it("renders the danger icon with aria-label \"Danger\"", () => {
		render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="Delete?"
				severity="danger"
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.getByRole("img", { name: /danger/i })).toBeInTheDocument();
	});

	it("renders the warning icon with aria-label \"Warning\"", () => {
		render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="Continue?"
				severity="warning"
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.getByRole("img", { name: /warning/i })).toBeInTheDocument();
	});

	it("renders the info icon with aria-label \"Info\"", () => {
		render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="Heads up"
				severity="info"
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.getByRole("img", { name: /info/i })).toBeInTheDocument();
	});

	it("uses severity-appropriate default confirm labels", () => {
		const { rerender } = render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="t"
				severity="info"
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();

		rerender(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="t"
				severity="warning"
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();

		rerender(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="t"
				severity="danger"
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
	});

	it("respects confirmLabel and cancelLabel overrides", () => {
		render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="t"
				confirmLabel="Run it"
				cancelLabel="Skip"
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.getByRole("button", { name: "Run it" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
	});
});

describe("Confirmation — async onConfirm", () => {
	it("shows the busy state while an async onConfirm is in flight", async () => {
		const user = userEvent.setup();
		let resolveConfirm: () => void = () => undefined;
		const onConfirm = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveConfirm = resolve;
				}),
		);
		const onOpenChange = vi.fn();
		render(
			<Confirmation
				open
				onOpenChange={onOpenChange}
				title="Run?"
				onConfirm={onConfirm}
			/>,
		);
		const confirm = screen.getByRole("button", { name: /continue/i });
		await user.click(confirm);
		// While the promise is pending, the button is in the busy state.
		expect(confirm).toHaveAttribute("aria-busy", "true");
		// Resolve and let React flush.
		resolveConfirm();
		await vi.waitFor(() => {
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});
	});

	it("leaves the dialog open and clears busy when async onConfirm rejects", async () => {
		const user = userEvent.setup();
		let rejectConfirm: (err: Error) => void = () => undefined;
		const onConfirm = vi.fn(
			() =>
				new Promise<void>((_resolve, reject) => {
					rejectConfirm = reject;
				}),
		);
		const onCancel = vi.fn();
		render(
			<Confirmation
				trigger={<button type="button">Open</button>}
				title="Run?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /open/i }));
		const confirm = screen.getByRole("button", { name: /continue/i });
		await user.click(confirm);
		expect(confirm).toHaveAttribute("aria-busy", "true");
		rejectConfirm(new Error("boom"));
		await vi.waitFor(() => {
			// Busy clears via finally — but the dialog stays open so the
			// consumer can render a follow-up error.
			expect(screen.queryByRole("button", { name: /continue/i })).not.toHaveAttribute(
				"aria-busy",
				"true",
			);
		});
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		// Failed confirm must NOT misfire onCancel.
		expect(onCancel).not.toHaveBeenCalled();
	});

	it("closes the dialog in uncontrolled mode after async onConfirm resolves", async () => {
		const user = userEvent.setup();
		let resolveConfirm: () => void = () => undefined;
		const onConfirm = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveConfirm = resolve;
				}),
		);
		render(
			<Confirmation
				trigger={<button type="button">Open</button>}
				title="Run?"
				onConfirm={onConfirm}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /open/i }));
		await user.click(screen.getByRole("button", { name: /continue/i }));
		// Pending — dialog stays open.
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		resolveConfirm();
		await vi.waitFor(() => {
			expect(screen.queryByRole("alertdialog")).toBeNull();
		});
	});
});

describe("Confirmation — onCancel routing", () => {
	it("fires onCancel on Escape dismissal", async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(
			<Confirmation
				trigger={<button type="button">Open</button>}
				title="Continue?"
				onConfirm={() => undefined}
				onCancel={onCancel}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /open/i }));
		await user.keyboard("{Escape}");
		expect(onCancel).toHaveBeenCalled();
		expect(screen.queryByRole("alertdialog")).toBeNull();
	});

	it("does not fire onCancel when a sync confirm closes the dialog", async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		const onConfirm = vi.fn();
		render(
			<Confirmation
				trigger={<button type="button">Open</button>}
				title="Continue?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /open/i }));
		await user.click(screen.getByRole("button", { name: /continue/i }));
		expect(onConfirm).toHaveBeenCalledOnce();
		// The dialog auto-closes after sync confirm; onCancel must NOT fire.
		expect(onCancel).not.toHaveBeenCalled();
	});

	it("does not fire onCancel while async confirm is in flight", async () => {
		const user = userEvent.setup();
		let resolveConfirm: () => void = () => undefined;
		const onCancel = vi.fn();
		const onConfirm = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveConfirm = resolve;
				}),
		);
		render(
			<Confirmation
				trigger={<button type="button">Open</button>}
				title="Run?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /open/i }));
		await user.click(screen.getByRole("button", { name: /continue/i }));
		// While pending, the dialog must stay open and onCancel must NOT fire
		// (the eventual close on success is via setOpen(false), guarded by
		// !isBusy in handleOpenChange).
		expect(onCancel).not.toHaveBeenCalled();
		resolveConfirm();
		await vi.waitFor(() => {
			expect(screen.queryByRole("alertdialog")).toBeNull();
		});
		// Successful confirm should NOT also fire onCancel.
		expect(onCancel).not.toHaveBeenCalled();
	});
});

describe("Confirmation — description", () => {
	it("renders the description when provided", () => {
		render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="Delete?"
				description="This action cannot be undone."
				onConfirm={() => undefined}
			/>,
		);
		expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
	});

	it("omits the description when not provided", () => {
		render(
			<Confirmation
				open
				onOpenChange={() => undefined}
				title="Delete?"
				onConfirm={() => undefined}
			/>,
		);
		// alertdialog renders, but no description text.
		expect(screen.queryByText("This action cannot be undone.")).toBeNull();
	});
});
