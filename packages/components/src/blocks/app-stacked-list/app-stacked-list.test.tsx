import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppStackedList } from "./app-stacked-list.js";

const ITEMS = [
	{ title: "Ada Lovelace", description: "ada@example.com", meta: "Owner", href: "/members/ada" },
	{ title: "Alan Turing", description: "alan@example.com", meta: "Admin" },
];

describe("AppStackedList", () => {
	it("renders each item's title (h3), meta, description; href makes the row a link", () => {
		render(<AppStackedList title="Members" items={ITEMS} />);
		expect(screen.getByRole("heading", { level: 2, name: "Members" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Ada Lovelace" })).toBeInTheDocument();
		expect(screen.getByText("ada@example.com")).toBeInTheDocument();
		expect(screen.getByText("Owner")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Ada Lovelace/ })).toHaveAttribute("href", "/members/ada");
		expect(screen.queryByRole("link", { name: /Alan Turing/ })).not.toBeInTheDocument();
	});
});
