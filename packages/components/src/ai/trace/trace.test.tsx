import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Trace } from "./trace.js";

const STEPS = [
	{ id: "1", kind: "think" as const, title: "Plan the migration", durationMs: 450 },
	{ id: "2", kind: "tool-call" as const, title: "read users.sql", durationMs: 120 },
	{ id: "3", kind: "observation" as const, title: "12 columns, 1.2M rows" },
	{ id: "4", kind: "error" as const, title: "ALTER failed", detail: "column already exists" },
];

describe("Trace — structure", () => {
	it("renders one li per step with the title", () => {
		render(<Trace steps={STEPS} ariaLabel="Trace" />);
		expect(screen.getAllByRole("listitem")).toHaveLength(4);
		expect(screen.getByText(/plan the migration/i)).toBeInTheDocument();
		expect(screen.getByText(/alter failed/i)).toBeInTheDocument();
	});

	it("labels the ordered list with the consumer-supplied ariaLabel", () => {
		render(<Trace steps={STEPS} ariaLabel="My agent" />);
		expect(screen.getByRole("list", { name: "My agent" })).toBeInTheDocument();
	});

	it("renders step detail underneath the title", () => {
		render(<Trace steps={STEPS} ariaLabel="Trace" />);
		expect(screen.getByText(/column already exists/i)).toBeInTheDocument();
	});
});

describe("Trace — indicators", () => {
	it("renders a kind-specific aria-label on each indicator", () => {
		render(<Trace steps={STEPS} ariaLabel="Trace" />);
		expect(screen.getByRole("img", { name: /thought/i })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /tool call/i })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /observation/i })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /error/i })).toBeInTheDocument();
	});
});

describe("Trace — meta", () => {
	it("formats duration < 1s as 'Nms'", () => {
		render(
			<Trace
				ariaLabel="Trace"
				steps={[{ id: "1", kind: "think", title: "fast", durationMs: 240 }]}
			/>,
		);
		expect(screen.getByText("240ms")).toBeInTheDocument();
	});

	it("formats duration >= 1s as 'X.Xs' or 'Ns' for >= 10s", () => {
		render(
			<Trace
				ariaLabel="Trace"
				steps={[
					{ id: "1", kind: "tool-call", title: "first", durationMs: 1500 },
					{ id: "2", kind: "tool-call", title: "second", durationMs: 12_400 },
				]}
			/>,
		);
		expect(screen.getByText("1.5s")).toBeInTheDocument();
		expect(screen.getByText("12s")).toBeInTheDocument();
	});

	it("renders timestamp + duration with separator when both are set", () => {
		render(
			<Trace
				ariaLabel="Trace"
				steps={[
					{ id: "1", kind: "tool-call", title: "fetch", timestamp: "14:30:02", durationMs: 240 },
				]}
			/>,
		);
		expect(screen.getByText("14:30:02")).toBeInTheDocument();
		expect(screen.getByText("240ms")).toBeInTheDocument();
	});

	it("omits the meta section entirely when neither duration nor timestamp is set", () => {
		render(
			<Trace
				ariaLabel="Trace"
				steps={[{ id: "1", kind: "think", title: "no meta" }]}
			/>,
		);
		// No duration text, no timestamp — only the title and indicator render.
		expect(screen.getByText("no meta")).toBeInTheDocument();
	});
});
