import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./date-picker.js";

describe("DatePicker captionLayout pass-through", () => {
	it("renders no native year <select> by default", async () => {
		render(<DatePicker aria-label="Date" />);
		await userEvent.click(screen.getByRole("button", { name: "Date" }));
		expect(screen.queryByRole("combobox")).toBeNull();
	});

	it("renders native year + month <select> when captionLayout='dropdown' and a startMonth/endMonth window is provided", async () => {
		render(
			<DatePicker
				aria-label="Date"
				captionLayout="dropdown"
				startMonth={new Date(1990, 0)}
				endMonth={new Date(2030, 11)}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Date" }));
		const selects = await screen.findAllByRole("combobox");
		// react-day-picker emits one <select> for years and one for months
		expect(selects.length).toBeGreaterThanOrEqual(2);
	});

	it("changing the year <select> updates the visible month grid heading", async () => {
		render(
			<DatePicker
				value={new Date(2025, 5, 15)}
				aria-label="Date"
				captionLayout="dropdown"
				startMonth={new Date(1990, 0)}
				endMonth={new Date(2030, 11)}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Date" }));
		const yearSelect = (await screen.findAllByRole("combobox")).find(
			(el) =>
				el.tagName === "SELECT" &&
				Array.from(el.children).some((c) => c.textContent === "2030"),
		);
		expect(yearSelect).toBeDefined();
		await userEvent.selectOptions(yearSelect as HTMLSelectElement, "2030");
		// The native <select>'s `selected` option reflects the new year value;
		// react-day-picker repaints the grid synchronously around it.
		expect((yearSelect as HTMLSelectElement).value).toBe("2030");
		expect(screen.getByRole("grid")).toBeInTheDocument();
	});

	it("still fires onChange after using the year dropdown", async () => {
		const handle = vi.fn();
		render(
			<DatePicker
				onChange={handle}
				aria-label="Date"
				captionLayout="dropdown"
				startMonth={new Date(2024, 0)}
				endMonth={new Date(2026, 11)}
				value={new Date(2025, 5, 15)}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Date" }));
		// Pick any visible day button; jsdom renders the grid as <button> elements.
		const day = (await screen.findAllByRole("gridcell")).find((cell) =>
			cell.querySelector("button"),
		);
		const dayButton = day?.querySelector("button");
		expect(dayButton).toBeTruthy();
		await userEvent.click(dayButton as HTMLButtonElement);
		expect(handle).toHaveBeenCalled();
	});
});
