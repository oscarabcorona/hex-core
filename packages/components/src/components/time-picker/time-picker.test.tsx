import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "./time-picker.js";

describe("TimePicker", () => {
	it("renders an <input type='time'> with the provided aria-label and current value", () => {
		render(<TimePicker value="09:30" aria-label="Meeting time" />);
		const input = screen.getByLabelText("Meeting time") as HTMLInputElement;
		expect(input.type).toBe("time");
		expect(input.value).toBe("09:30");
	});

	it("fires onChange with the new HH:MM string when the user types a value", () => {
		const handle = vi.fn();
		render(<TimePicker onChange={handle} aria-label="Time" />);
		const input = screen.getByLabelText("Time") as HTMLInputElement;
		fireEvent.change(input, { target: { value: "14:45" } });
		expect(handle).toHaveBeenCalledWith("14:45");
	});

	it("forwards step / min / max to the underlying input", () => {
		render(
			<TimePicker
				value="09:00"
				step={300}
				min="09:00"
				max="17:00"
				aria-label="Window"
			/>,
		);
		const input = screen.getByLabelText("Window") as HTMLInputElement;
		expect(input.step).toBe("300");
		expect(input.min).toBe("09:00");
		expect(input.max).toBe("17:00");
	});

	it("disabled state is announced and the input is non-interactive", () => {
		render(<TimePicker value="09:00" disabled aria-label="Time" />);
		const input = screen.getByLabelText("Time") as HTMLInputElement;
		expect(input.disabled).toBe(true);
	});

	it("forwards refs so callers can integrate with form libraries", () => {
		const ref = { current: null as HTMLInputElement | null };
		render(<TimePicker ref={ref} aria-label="Time" />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});
});
