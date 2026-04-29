import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Attachment } from "./attachment.js";

describe("Attachment", () => {
	it("renders the file variant for non-image MIME", () => {
		render(<Attachment file={{ name: "report.pdf", size: 2000, type: "application/pdf" }} />);
		expect(screen.getByText("report.pdf")).toBeInTheDocument();
		expect(screen.getByText("2.0 KB")).toBeInTheDocument();
	});

	it("renders the image variant when MIME is image/* AND preview URL is set", () => {
		render(
			<Attachment
				file={{
					name: "screenshot.png",
					size: 1000,
					type: "image/png",
					preview: "blob:fake",
				}}
			/>,
		);
		const img = screen.getByRole("img", { name: "screenshot.png" });
		expect(img).toHaveAttribute("src", "blob:fake");
	});

	it("falls back to the file variant when image MIME has no preview URL", () => {
		render(
			<Attachment file={{ name: "no-preview.png", size: 500, type: "image/png" }} />,
		);
		expect(screen.getByText("no-preview.png")).toBeInTheDocument();
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("renders the remove button only when onRemove is provided", () => {
		const { rerender } = render(
			<Attachment file={{ name: "x.pdf", size: 1, type: "application/pdf" }} />,
		);
		expect(screen.queryByRole("button", { name: /Remove/ })).not.toBeInTheDocument();

		rerender(
			<Attachment
				file={{ name: "x.pdf", size: 1, type: "application/pdf" }}
				onRemove={() => {}}
			/>,
		);
		expect(screen.getByRole("button", { name: "Remove x.pdf" })).toBeInTheDocument();
	});

	it("invokes onRemove when the remove button is clicked", async () => {
		const onRemove = vi.fn();
		render(
			<Attachment
				file={{ name: "x.pdf", size: 1, type: "application/pdf" }}
				onRemove={onRemove}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Remove x.pdf" }));
		expect(onRemove).toHaveBeenCalledOnce();
	});

	it("renders a progressbar overlay scaled 0–100 when progress is set and < 1", () => {
		render(
			<Attachment
				file={{ name: "upload.bin", size: 500, type: "application/octet-stream" }}
				progress={0.42}
			/>,
		);
		const bar = screen.getByRole("progressbar", { name: "Uploading upload.bin" });
		expect(bar).toHaveAttribute("aria-valuenow", "42");
		expect(bar).toHaveAttribute("aria-valuemax", "100");
		expect(bar).toHaveAttribute("aria-valuemin", "0");
	});

	it("falls back to file variant when variant='image' is forced but no preview is set (M3)", () => {
		render(
			<Attachment
				variant="image"
				file={{ name: "no-preview.png", size: 500, type: "image/png" }}
			/>,
		);
		// File fallback rendered (icon + name + size), NOT an empty image.
		expect(screen.getByText("no-preview.png")).toBeInTheDocument();
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("hides the progressbar when progress is undefined or 1", () => {
		const { rerender } = render(
			<Attachment file={{ name: "x", size: 1, type: "text/plain" }} />,
		);
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

		rerender(
			<Attachment file={{ name: "x", size: 1, type: "text/plain" }} progress={1} />,
		);
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("formats various sizes correctly", () => {
		const { rerender } = render(
			<Attachment file={{ name: "a", size: 512, type: "text/plain" }} />,
		);
		expect(screen.getByText("512 B")).toBeInTheDocument();

		rerender(<Attachment file={{ name: "a", size: 2048, type: "text/plain" }} />);
		expect(screen.getByText("2.0 KB")).toBeInTheDocument();

		rerender(
			<Attachment file={{ name: "a", size: 1_500_000, type: "text/plain" }} />,
		);
		expect(screen.getByText("1.4 MB")).toBeInTheDocument();
	});
});
