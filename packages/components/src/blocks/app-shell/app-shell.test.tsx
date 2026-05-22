import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppShell } from "./app-shell.js";

describe("AppShell", () => {
	it("renders sidebar, header, and main content", () => {
		render(
			<AppShell sidebar={<nav>Nav</nav>} header={<span>Topbar</span>}>
				<p>Body content</p>
			</AppShell>,
		);
		expect(screen.getByText("Nav")).toBeInTheDocument();
		expect(screen.getByText("Topbar")).toBeInTheDocument();
		expect(screen.getByText("Body content")).toBeInTheDocument();
	});

	it("opens the mobile drawer from the menu button", async () => {
		const user = userEvent.setup();
		render(
			<AppShell sidebar={<nav>Nav</nav>}>
				<p>Body</p>
			</AppShell>,
		);
		const openButton = screen.getByRole("button", { name: "Open menu" });
		expect(openButton).toHaveAttribute("aria-expanded", "false");
		await user.click(openButton);
		// Drawer adds a dismiss button; the sidebar nav now appears twice (drawer + desktop).
		expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
		expect(screen.getAllByText("Nav")).toHaveLength(2);
	});
});
