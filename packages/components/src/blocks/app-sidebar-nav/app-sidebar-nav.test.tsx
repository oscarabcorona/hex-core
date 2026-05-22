import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppSidebarNav } from "./app-sidebar-nav.js";

const GROUPS = [
	{ items: [{ label: "Dashboard", href: "/app", active: true }, { label: "Reports", href: "/app/reports" }] },
	{ title: "Settings", items: [{ label: "Billing", href: "/app/billing" }] },
];

describe("AppSidebarNav", () => {
	it("renders brand, group titles, links, and footer", () => {
		render(
			<AppSidebarNav
				brand={<span>Acme</span>}
				groups={GROUPS}
				footer={<a href="/logout">Sign out</a>}
			/>,
		);
		expect(screen.getByText("Acme")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Reports" })).toHaveAttribute("href", "/app/reports");
		expect(screen.getByRole("link", { name: "Sign out" })).toBeInTheDocument();
	});

	it("marks the active item with aria-current=page", () => {
		render(<AppSidebarNav groups={GROUPS} />);
		expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
		expect(screen.getByRole("link", { name: "Reports" })).not.toHaveAttribute("aria-current");
	});
});
