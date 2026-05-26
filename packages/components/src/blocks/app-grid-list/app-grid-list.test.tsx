import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppGridList } from "./app-grid-list.js";

const ITEMS = [
	{ title: "Customer dashboard", description: "Sales analytics.", meta: "2h ago", href: "/projects/customer" },
	{ title: "Internal admin", description: "Tools." },
];

describe("AppGridList", () => {
	it("renders each card's title (h3), meta, description; href makes the card a link", () => {
		render(<AppGridList title="Projects" items={ITEMS} />);
		expect(screen.getByRole("heading", { level: 2, name: "Projects" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Customer dashboard" })).toBeInTheDocument();
		expect(screen.getByText("2h ago")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Customer dashboard/ })).toHaveAttribute("href", "/projects/customer");
		expect(screen.queryByRole("link", { name: /Internal admin/ })).not.toBeInTheDocument();
	});
});
