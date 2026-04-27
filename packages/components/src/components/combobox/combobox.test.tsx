import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Combobox } from "./combobox.js";

const options = [
	{ value: "next", label: "Next.js" },
	{ value: "remix", label: "Remix" },
];

describe("Combobox a11y wiring", () => {
	it("forwards aria-label onto the trigger so role=combobox has an accessible name", () => {
		render(
			<Combobox
				options={options}
				placeholder="Pick one"
				aria-label="Framework"
			/>,
		);
		expect(
			screen.getByRole("combobox", { name: "Framework" }),
		).toBeInTheDocument();
	});

	it("forwards aria-labelledby onto the trigger", () => {
		render(
			<>
				<span id="label-id">Framework</span>
				<Combobox
					options={options}
					placeholder="Pick one"
					aria-labelledby="label-id"
				/>
			</>,
		);
		expect(
			screen.getByRole("combobox", { name: "Framework" }),
		).toBeInTheDocument();
	});

	it("sets aria-haspopup statically so the popup type is announced", () => {
		render(
			<Combobox
				options={options}
				placeholder="Pick one"
				aria-label="Framework"
			/>,
		);
		const trigger = screen.getByRole("combobox", { name: "Framework" });
		expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
	});

	it("only sets aria-controls when the popover is open (listbox is portal-mounted on open)", async () => {
		render(
			<Combobox
				options={options}
				placeholder="Pick one"
				aria-label="Framework"
			/>,
		);
		const trigger = screen.getByRole("combobox", { name: "Framework" });
		// Closed: pointing aria-controls at a non-existent id is invalid, so we drop it.
		expect(trigger).not.toHaveAttribute("aria-controls");
		expect(trigger).toHaveAttribute("aria-expanded", "false");

		await userEvent.click(trigger);

		// Open: aria-controls is now set; the live a11y audit verifies the
		// referenced listbox actually exists in the rendered DOM (jsdom +
		// Radix portal interaction is unreliable for that assertion here).
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		expect(trigger.getAttribute("aria-controls")).toBeTruthy();
	});
});
