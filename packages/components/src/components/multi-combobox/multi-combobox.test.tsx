import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiCombobox } from "./multi-combobox.js";

const tags = [
	{ value: "bug", label: "Bug" },
	{ value: "feature", label: "Feature" },
	{ value: "question", label: "Question" },
	{ value: "docs", label: "Documentation" },
];

describe("MultiCombobox", () => {
	it("forwards aria-label, aria-haspopup='listbox' and starts collapsed", () => {
		render(<MultiCombobox options={tags} aria-label="Tags" />);
		const trigger = screen.getByRole("combobox", { name: "Tags" });
		expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
		expect(trigger).toHaveAttribute("aria-expanded", "false");
	});

	it("picking two options fires onChange with both values and keeps the popover open", async () => {
		const handle = vi.fn();
		render(
			<MultiCombobox
				options={tags}
				value={[]}
				onChange={handle}
				aria-label="Tags"
			/>,
		);
		const trigger = screen.getByRole("combobox", { name: "Tags" });
		await userEvent.click(trigger);

		await userEvent.click(await screen.findByText("Bug"));
		expect(handle).toHaveBeenLastCalledWith(["bug"]);
	});

	it("clicking an already-selected option toggles it off", async () => {
		const handle = vi.fn();
		render(
			<MultiCombobox
				options={tags}
				value={["bug", "feature"]}
				onChange={handle}
				aria-label="Tags"
			/>,
		);
		await userEvent.click(screen.getByRole("combobox", { name: "Tags" }));
		await userEvent.click(await screen.findByText("Bug"));
		expect(handle).toHaveBeenLastCalledWith(["feature"]);
	});

	it("maxSelected makes unselected options aria-disabled and ignores their clicks", async () => {
		const handle = vi.fn();
		render(
			<MultiCombobox
				options={tags}
				value={["bug", "feature"]}
				onChange={handle}
				maxSelected={2}
				aria-label="Tags"
			/>,
		);
		await userEvent.click(screen.getByRole("combobox", { name: "Tags" }));
		const questionItem = (await screen.findByText("Question")).closest(
			"[role='option']",
		);
		expect(questionItem).toHaveAttribute("aria-disabled", "true");

		await userEvent.click(questionItem as HTMLElement);
		expect(handle).not.toHaveBeenCalled();
	});

	it("each option's aria-selected reflects current value membership", async () => {
		render(
			<MultiCombobox options={tags} value={["bug"]} aria-label="Tags" />,
		);
		await userEvent.click(screen.getByRole("combobox", { name: "Tags" }));
		const bug = (await screen.findByText("Bug")).closest("[role='option']");
		const feature = (await screen.findByText("Feature")).closest(
			"[role='option']",
		);
		expect(bug).toHaveAttribute("aria-selected", "true");
		expect(feature).toHaveAttribute("aria-selected", "false");
	});

	it("trigger label shows '{n} selected' with the comma-joined list mirrored on title", () => {
		render(
			<MultiCombobox
				options={tags}
				value={["bug", "feature"]}
				aria-label="Tags"
			/>,
		);
		const trigger = screen.getByRole("combobox", { name: "Tags" });
		expect(trigger).toHaveTextContent("2 selected");
		expect(trigger).toHaveAttribute("title", "Bug, Feature");
	});

	it("the live region is OUTSIDE the trigger so it doesn't pollute the accessible name", () => {
		render(<MultiCombobox options={tags} value={["bug"]} aria-label="Tags" />);
		const trigger = screen.getByRole("combobox", { name: "Tags" });
		// aria-label="Tags" stays the accessible name regardless of selection
		expect(trigger.getAttribute("aria-label")).toBe("Tags");
		// The live region exists in the document, but not as a descendant of the trigger
		expect(trigger.querySelector('[aria-live="polite"]')).toBeNull();
		expect(document.querySelector('[aria-live="polite"]')).not.toBeNull();
	});

	it("closeOnSelect={true} closes the popover after a single pick", async () => {
		const handle = vi.fn();
		render(
			<MultiCombobox
				options={tags}
				value={[]}
				onChange={handle}
				closeOnSelect
				aria-label="Tags"
			/>,
		);
		const trigger = screen.getByRole("combobox", { name: "Tags" });
		await userEvent.click(trigger);
		await userEvent.click(await screen.findByText("Bug"));
		expect(handle).toHaveBeenLastCalledWith(["bug"]);
		expect(trigger).toHaveAttribute("aria-expanded", "false");
	});
});
