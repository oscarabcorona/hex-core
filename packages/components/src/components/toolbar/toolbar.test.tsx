import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Toolbar,
	ToolbarButton,
	ToolbarSeparator,
	ToolbarToggleGroup,
	ToolbarToggleItem,
} from "./toolbar.js";

describe("Toolbar", () => {
	it("mounts with role='toolbar' and the supplied aria-label", () => {
		render(
			<Toolbar aria-label="Editor controls">
				<ToolbarButton>Undo</ToolbarButton>
			</Toolbar>,
		);
		expect(screen.getByRole("toolbar", { name: "Editor controls" })).toBeInTheDocument();
	});

	it("renders ToolbarButton children", () => {
		render(
			<Toolbar aria-label="Test">
				<ToolbarButton>Undo</ToolbarButton>
				<ToolbarButton>Redo</ToolbarButton>
			</Toolbar>,
		);
		expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Redo" })).toBeInTheDocument();
	});

	it("renders a ToolbarSeparator with role='separator'", () => {
		render(
			<Toolbar aria-label="Test">
				<ToolbarButton>A</ToolbarButton>
				<ToolbarSeparator />
				<ToolbarButton>B</ToolbarButton>
			</Toolbar>,
		);
		expect(screen.getByRole("separator")).toBeInTheDocument();
	});

	it("supports vertical orientation", () => {
		render(
			<Toolbar aria-label="Vertical" orientation="vertical">
				<ToolbarButton>A</ToolbarButton>
			</Toolbar>,
		);
		expect(screen.getByRole("toolbar")).toHaveAttribute("aria-orientation", "vertical");
	});

	it("ToolbarToggleGroup type='single' announces aria-pressed-like state on items", () => {
		render(
			<Toolbar aria-label="Test">
				<ToolbarToggleGroup type="single" defaultValue="left">
					<ToolbarToggleItem value="left">Left</ToolbarToggleItem>
					<ToolbarToggleItem value="right">Right</ToolbarToggleItem>
				</ToolbarToggleGroup>
			</Toolbar>,
		);
		// Radix uses data-state="on"/"off" for toggle items.
		expect(screen.getByText("Left").closest("button")).toHaveAttribute("data-state", "on");
		expect(screen.getByText("Right").closest("button")).toHaveAttribute("data-state", "off");
	});
});
