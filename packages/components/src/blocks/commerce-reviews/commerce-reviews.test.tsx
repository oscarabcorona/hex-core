import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommerceReviews } from "./commerce-reviews.js";

const REVIEWS = [
	{ author: "Jordan", rating: 5, title: "Perfect", body: "Exactly as described.", date: "Mar 2026" },
	{ author: "Sam", rating: 4, body: "Great quality, runs large.", date: "Feb 2026" },
];

describe("CommerceReviews", () => {
	it("renders the average summary and each review", () => {
		render(<CommerceReviews averageRating={4.5} totalCount={128} reviews={REVIEWS} />);
		expect(screen.getByRole("heading", { level: 2, name: "Customer reviews" })).toBeInTheDocument();
		// Numeric rating text carries the rating (not color alone).
		expect(screen.getByText(/4\.5 out of 5/)).toBeInTheDocument();
		expect(screen.getByText(/128 reviews/)).toBeInTheDocument();
		expect(screen.getByText("Exactly as described.")).toBeInTheDocument();
		expect(screen.getByText("Jordan")).toBeInTheDocument();
	});

	it("renders without a summary header when averageRating is omitted", () => {
		render(<CommerceReviews reviews={REVIEWS} />);
		expect(screen.queryByText(/out of 5/)).not.toBeInTheDocument();
		expect(screen.getByText("Great quality, runs large.")).toBeInTheDocument();
	});
});
