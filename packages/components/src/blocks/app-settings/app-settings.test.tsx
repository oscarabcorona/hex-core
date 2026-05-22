import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppSettings } from "./app-settings.js";

describe("AppSettings", () => {
	it("renders each group's title, description, and controls", () => {
		render(
			<AppSettings
				groups={[
					{
						title: "Profile",
						description: "Update your account details.",
						children: <input aria-label="Name" defaultValue="Ada" />,
					},
					{ title: "Notifications", children: <input aria-label="Emails" type="checkbox" /> },
				]}
			/>,
		);
		expect(screen.getByRole("heading", { level: 3, name: "Profile" })).toBeInTheDocument();
		expect(screen.getByText("Update your account details.")).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Notifications" })).toBeInTheDocument();
		expect(screen.getByLabelText("Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Emails")).toBeInTheDocument();
	});
});
