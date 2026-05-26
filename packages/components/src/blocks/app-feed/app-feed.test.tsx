import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppFeed } from "./app-feed.js";

const GROUPS = [
	{
		date: "Today",
		events: [
			{ actor: "Ada Lovelace", message: "merged pull request #42", time: "9:42 AM" },
			{ actor: "Alan Turing", message: "commented on issue #18" },
		],
	},
	{ date: "May 21", events: [{ message: "deployed to production" }] },
];

describe("AppFeed", () => {
	it("renders each group's date + every event with actor/message/time", () => {
		render(<AppFeed title="Activity" groups={GROUPS} />);
		expect(screen.getByRole("heading", { level: 2, name: "Activity" })).toBeInTheDocument();
		expect(screen.getByText("Today")).toBeInTheDocument();
		expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
		expect(screen.getByText("merged pull request #42")).toBeInTheDocument();
		expect(screen.getByText("9:42 AM")).toBeInTheDocument();
		expect(screen.getByText("May 21")).toBeInTheDocument();
		expect(screen.getByText("deployed to production")).toBeInTheDocument();
	});
});
