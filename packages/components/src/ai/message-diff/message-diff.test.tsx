import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageDiff } from "./message-diff.js";

describe("MessageDiff — structure", () => {
	it("renders both sides with their labels", () => {
		render(
			<MessageDiff
				left={{ label: "GPT-5", role: "assistant", content: "Left text" }}
				right={{ label: "Claude", role: "assistant", content: "Right text" }}
			/>,
		);
		expect(screen.getByText("GPT-5")).toBeInTheDocument();
		expect(screen.getByText("Claude")).toBeInTheDocument();
		expect(screen.getByText("Left text")).toBeInTheDocument();
		expect(screen.getByText("Right text")).toBeInTheDocument();
	});

	it("labels the comparison group for screen readers", () => {
		render(
			<MessageDiff
				left={{ label: "L", role: "assistant", content: "left" }}
				right={{ label: "R", role: "assistant", content: "right" }}
			/>,
		);
		expect(screen.getByRole("group", { name: "Message comparison" })).toBeInTheDocument();
	});

	it("renders meta text in the header when provided", () => {
		render(
			<MessageDiff
				left={{ label: "Run #1", role: "assistant", content: "a", meta: "Score: 0.82" }}
				right={{ label: "Run #2", role: "assistant", content: "b", meta: "Score: 0.91" }}
			/>,
		);
		expect(screen.getByText("Score: 0.82")).toBeInTheDocument();
		expect(screen.getByText("Score: 0.91")).toBeInTheDocument();
	});

	it("wires the data-side attribute on each column for navigation hooks", () => {
		render(
			<MessageDiff
				left={{ label: "L", role: "assistant", content: "left" }}
				right={{ label: "R", role: "assistant", content: "right" }}
			/>,
		);
		expect(document.querySelector('[data-side="left"]')).not.toBeNull();
		expect(document.querySelector('[data-side="right"]')).not.toBeNull();
	});
});

describe("MessageDiff — roles", () => {
	it("inherits Message styling for each side's role", () => {
		render(
			<MessageDiff
				left={{ label: "Before", role: "user", content: "user side" }}
				right={{ label: "After", role: "assistant", content: "assistant side" }}
			/>,
		);
		// data-role set on the inner Message (per Message component contract).
		expect(document.querySelector('[data-role="user"]')).not.toBeNull();
		expect(document.querySelector('[data-role="assistant"]')).not.toBeNull();
	});
});

describe("MessageDiff — responsive collapse", () => {
	it("uses md:grid-cols-2 by default", () => {
		const { container } = render(
			<MessageDiff
				left={{ label: "L", role: "assistant", content: "a" }}
				right={{ label: "R", role: "assistant", content: "b" }}
			/>,
		);
		expect(container.firstChild).toHaveClass("md:grid-cols-2");
	});

	it("respects collapseBelow=\"lg\"", () => {
		const { container } = render(
			<MessageDiff
				left={{ label: "L", role: "assistant", content: "a" }}
				right={{ label: "R", role: "assistant", content: "b" }}
				collapseBelow="lg"
			/>,
		);
		expect(container.firstChild).toHaveClass("lg:grid-cols-2");
	});
});
