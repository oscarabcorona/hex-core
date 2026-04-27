import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "./dialog.js";

describe("Dialog overflow behavior", () => {
	it("renders an inner scroll container so long content scrolls without dragging the close button", () => {
		render(
			<Dialog defaultOpen>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Long content</DialogTitle>
					</DialogHeader>
					<div data-testid="long-body">
						{Array.from({ length: 200 }, (_, i) => (
							<p key={i}>Paragraph {i + 1}</p>
						))}
					</div>
				</DialogContent>
			</Dialog>,
		);

		const dialog = screen.getByRole("dialog");
		// Outer panel caps height but does not scroll — close button stays anchored.
		expect(dialog.className).toMatch(/max-h-\[calc\(100vh-2rem\)\]/);
		expect(dialog.className).not.toMatch(/overflow-y-auto/);

		// Children live inside an inner scroll container with overflow-y-auto.
		const body = screen.getByTestId("long-body");
		const scrollContainer = body.parentElement;
		expect(scrollContainer).not.toBeNull();
		expect(scrollContainer?.className).toMatch(/overflow-y-auto/);

		// Close button is a descendant of the dialog but a *sibling* of the
		// scroll container (i.e. it lives in the non-scrolling layer).
		const closeButton = screen.getByRole("button", { name: /close/i });
		expect(dialog).toContainElement(closeButton);
		expect(scrollContainer).not.toContainElement(closeButton);
	});

	it("renders children directly when scrollable={false} (CommandDialog opts out)", () => {
		render(
			<Dialog defaultOpen>
				<DialogContent scrollable={false}>
					<DialogHeader>
						<DialogTitle>Palette</DialogTitle>
					</DialogHeader>
					<div data-testid="cmdk-body">items</div>
				</DialogContent>
			</Dialog>,
		);
		const dialog = screen.getByRole("dialog");
		expect(dialog.className).not.toMatch(/max-h-\[calc\(100vh-2rem\)\]/);
		// No inner overflow wrapper — child is a direct descendant.
		const body = screen.getByTestId("cmdk-body");
		expect(body.parentElement?.className ?? "").not.toMatch(/overflow-y-auto/);
	});
});
