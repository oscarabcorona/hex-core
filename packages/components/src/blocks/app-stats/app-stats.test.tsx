import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppStats } from "./app-stats.js";

const STATS = [
	{ label: "Revenue", value: "$48.2k", change: "+12%", changeType: "increase" as const },
	{ label: "Churn", value: "1.8%", change: "-0.3%", changeType: "decrease" as const },
];

describe("AppStats", () => {
	it("renders each stat's label, value, and change", () => {
		render(<AppStats stats={STATS} />);
		expect(screen.getByText("Revenue")).toBeInTheDocument();
		expect(screen.getByText("$48.2k")).toBeInTheDocument();
		expect(screen.getByText("+12%")).toBeInTheDocument();
		expect(screen.getByText("Churn")).toBeInTheDocument();
		expect(screen.getByText("-0.3%")).toBeInTheDocument();
	});

	it("renders a stat without a change delta", () => {
		render(<AppStats stats={[{ label: "Open tickets", value: "37" }]} />);
		expect(screen.getByText("Open tickets")).toBeInTheDocument();
		expect(screen.getByText("37")).toBeInTheDocument();
	});
});
