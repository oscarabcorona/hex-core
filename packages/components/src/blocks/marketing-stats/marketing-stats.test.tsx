import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingStats } from "./marketing-stats.js";

const STATS = [
	{ value: "12,480", label: "Active teams", description: "Across 64 countries." },
	{ value: "$48M", label: "Shipped value" },
	{ value: "99.9%", label: "Uptime" },
];

describe("MarketingStats", () => {
	it("renders value/label/description for each stat with <dl>/<dt>/<dd>", () => {
		render(<MarketingStats title="By the numbers" stats={STATS} />);
		expect(screen.getByRole("heading", { level: 2, name: "By the numbers" })).toBeInTheDocument();
		expect(screen.getByText("12,480")).toBeInTheDocument();
		expect(screen.getByText("Active teams")).toBeInTheDocument();
		expect(screen.getByText("Across 64 countries.")).toBeInTheDocument();
		expect(screen.getByText("$48M")).toBeInTheDocument();
	});
});
