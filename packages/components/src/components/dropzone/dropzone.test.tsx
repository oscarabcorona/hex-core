import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropzone } from "./dropzone.js";

/** Build a minimal `File` with the given name + payload size; used by every drop assertion. */
function makeFile(name: string, bytes: number, type = "text/plain"): File {
	return new File([new Uint8Array(bytes)], name, { type });
}

describe("Dropzone", () => {
	it("exposes a role='button' with the required aria-label and tabIndex=0", () => {
		render(<Dropzone aria-label="Upload images" />);
		const dropzone = screen.getByRole("button", { name: "Upload images" });
		expect(dropzone).toHaveAttribute("tabindex", "0");
	});

	it("Enter key opens the file dialog (clicks the hidden input)", () => {
		const { container } = render(<Dropzone aria-label="Upload" />);
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const clickSpy = vi.spyOn(input, "click");

		const dropzone = screen.getByRole("button", { name: "Upload" });
		fireEvent.keyDown(dropzone, { key: "Enter" });
		expect(clickSpy).toHaveBeenCalled();
	});

	it("Space key opens the file dialog", () => {
		const { container } = render(<Dropzone aria-label="Upload" />);
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const clickSpy = vi.spyOn(input, "click");

		const dropzone = screen.getByRole("button", { name: "Upload" });
		fireEvent.keyDown(dropzone, { key: " " });
		expect(clickSpy).toHaveBeenCalled();
	});

	it("dropping files emits onFilesSelected with the dropped File[]", async () => {
		const handle = vi.fn();
		const { container } = render(
			<Dropzone aria-label="Upload" onFilesSelected={handle} />,
		);
		const dropzone = container.querySelector("[role='button']") as HTMLElement;
		const file = makeFile("a.txt", 10);

		fireEvent.drop(dropzone, {
			dataTransfer: { files: [file], types: ["Files"] },
		});

		expect(handle).toHaveBeenCalledTimes(1);
		expect(handle.mock.calls[0][0][0].name).toBe("a.txt");
	});

	it("filters out files over maxSize before emitting", () => {
		const handle = vi.fn();
		const { container } = render(
			<Dropzone aria-label="Upload" maxSize={100} onFilesSelected={handle} />,
		);
		const dropzone = container.querySelector("[role='button']") as HTMLElement;
		const small = makeFile("ok.txt", 50);
		const large = makeFile("big.txt", 500);

		fireEvent.drop(dropzone, {
			dataTransfer: { files: [small, large], types: ["Files"] },
		});

		expect(handle).toHaveBeenCalledTimes(1);
		const emitted = handle.mock.calls[0][0] as File[];
		expect(emitted).toHaveLength(1);
		expect(emitted[0].name).toBe("ok.txt");
	});

	it("filters by accept (MIME prefix with /*)", () => {
		const handle = vi.fn();
		const { container } = render(
			<Dropzone aria-label="Images" accept="image/*" onFilesSelected={handle} />,
		);
		const dropzone = container.querySelector("[role='button']") as HTMLElement;
		const png = makeFile("a.png", 10, "image/png");
		const txt = makeFile("a.txt", 10, "text/plain");

		fireEvent.drop(dropzone, {
			dataTransfer: { files: [png, txt], types: ["Files"] },
		});

		expect(handle).toHaveBeenCalledTimes(1);
		const emitted = handle.mock.calls[0][0] as File[];
		expect(emitted).toHaveLength(1);
		expect(emitted[0].type).toBe("image/png");
	});

	it("disabled removes the drop area from the tab order and ignores drops", () => {
		const handle = vi.fn();
		const { container } = render(
			<Dropzone aria-label="Upload" disabled onFilesSelected={handle} />,
		);
		const dropzone = container.querySelector("[role='button']") as HTMLElement;
		expect(dropzone).toHaveAttribute("tabindex", "-1");
		expect(dropzone).toHaveAttribute("aria-disabled", "true");

		fireEvent.drop(dropzone, {
			dataTransfer: { files: [makeFile("a.txt", 10)], types: ["Files"] },
		});
		expect(handle).not.toHaveBeenCalled();
	});

	it("sets data-drag-over while dragging and clears it on drop", () => {
		const { container } = render(<Dropzone aria-label="Upload" />);
		const dropzone = container.querySelector("[role='button']") as HTMLElement;

		fireEvent.dragEnter(dropzone, { dataTransfer: { types: ["Files"] } });
		expect(dropzone).toHaveAttribute("data-drag-over", "true");

		fireEvent.drop(dropzone, {
			dataTransfer: { files: [makeFile("a.txt", 5)], types: ["Files"] },
		});
		expect(dropzone).not.toHaveAttribute("data-drag-over");
	});

	it("onFilesRejected fires when ALL dropped files are filtered out", () => {
		const onSelected = vi.fn();
		const onRejected = vi.fn();
		const { container } = render(
			<Dropzone
				aria-label="Upload"
				maxSize={100}
				onFilesSelected={onSelected}
				onFilesRejected={onRejected}
			/>,
		);
		const dropzone = container.querySelector("[role='button']") as HTMLElement;
		const tooBig = makeFile("big.txt", 1000);

		fireEvent.drop(dropzone, {
			dataTransfer: { files: [tooBig], types: ["Files"] },
		});
		expect(onSelected).not.toHaveBeenCalled();
		expect(onRejected).toHaveBeenCalledTimes(1);
		expect((onRejected.mock.calls[0][0] as File[])[0].name).toBe("big.txt");
	});

	it("onFilesRejected also reports partial-rejection when some files pass and others don't", () => {
		const onSelected = vi.fn();
		const onRejected = vi.fn();
		const { container } = render(
			<Dropzone
				aria-label="Upload"
				maxSize={100}
				onFilesSelected={onSelected}
				onFilesRejected={onRejected}
			/>,
		);
		const dropzone = container.querySelector("[role='button']") as HTMLElement;
		fireEvent.drop(dropzone, {
			dataTransfer: {
				files: [makeFile("ok.txt", 50), makeFile("big.txt", 1000)],
				types: ["Files"],
			},
		});
		expect(onSelected).toHaveBeenCalledTimes(1);
		expect((onSelected.mock.calls[0][0] as File[])[0].name).toBe("ok.txt");
		expect(onRejected).toHaveBeenCalledTimes(1);
		expect((onRejected.mock.calls[0][0] as File[])[0].name).toBe("big.txt");
	});

	it("multiple={false} keeps only the first accepted file even when several are dropped", () => {
		const onSelected = vi.fn();
		const onRejected = vi.fn();
		const { container } = render(
			<Dropzone
				aria-label="Avatar"
				multiple={false}
				onFilesSelected={onSelected}
				onFilesRejected={onRejected}
			/>,
		);
		const dropzone = container.querySelector("[role='button']") as HTMLElement;
		fireEvent.drop(dropzone, {
			dataTransfer: {
				files: [makeFile("a.png", 10), makeFile("b.png", 10)],
				types: ["Files"],
			},
		});
		const accepted = onSelected.mock.calls[0][0] as File[];
		expect(accepted).toHaveLength(1);
		expect(accepted[0].name).toBe("a.png");
		// The second file is reported as rejected so consumers can toast it
		expect(onRejected).toHaveBeenCalledTimes(1);
	});

	it("hidden file input is sr-only but stays in the accessibility tree (no aria-hidden)", () => {
		const { container } = render(<Dropzone aria-label="Upload" />);
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		expect(input.className).toContain("sr-only");
		expect(input).not.toHaveAttribute("aria-hidden");
		expect(input).not.toHaveAttribute("tabindex", "-1");
	});
});
