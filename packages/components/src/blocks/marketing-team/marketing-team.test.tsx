import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingTeam } from "./marketing-team.js";

const MEMBERS = [
	{ name: "Jordan Lee", role: "Head of Design", bio: "Design systems + AI." },
	{ name: "Sam Patel", role: "CTO" },
];

describe("MarketingTeam", () => {
	it("renders each member's name (h3) + role + optional bio", () => {
		render(<MarketingTeam title="Team" members={MEMBERS} />);
		expect(screen.getByRole("heading", { level: 2, name: "Team" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Jordan Lee" })).toBeInTheDocument();
		expect(screen.getByText("Head of Design")).toBeInTheDocument();
		expect(screen.getByText("Design systems + AI.")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Sam Patel" })).toBeInTheDocument();
	});
});
