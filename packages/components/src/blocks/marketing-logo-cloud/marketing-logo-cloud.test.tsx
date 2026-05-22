import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingLogoCloud } from "./marketing-logo-cloud.js";

describe("MarketingLogoCloud", () => {
	it("renders the caption and each logo", () => {
		render(
			<MarketingLogoCloud
				title="Trusted by teams"
				logos={[
					<img key="a" src="/a.svg" alt="Acme" />,
					<img key="b" src="/b.svg" alt="Globex" />,
				]}
			/>,
		);
		expect(screen.getByText("Trusted by teams")).toBeInTheDocument();
		expect(screen.getByAltText("Acme")).toBeInTheDocument();
		expect(screen.getByAltText("Globex")).toBeInTheDocument();
	});
});
