import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarketingContent } from "./marketing-content.js";

const POSTS = [
	{ title: "Page recipes, explained", excerpt: "Why we built it.", href: "/blog/recipes", meta: "May 22 · 4 min" },
	{ title: "Theming with tokens", excerpt: "One swap, the site restyles." },
];

describe("MarketingContent", () => {
	it("renders each post: title (h3), excerpt, meta; href makes the card a link", () => {
		render(<MarketingContent title="From the blog" posts={POSTS} />);
		expect(screen.getByRole("heading", { level: 2, name: "From the blog" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Page recipes, explained" })).toBeInTheDocument();
		expect(screen.getByText("Why we built it.")).toBeInTheDocument();
		expect(screen.getByText("May 22 · 4 min")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Page recipes, explained/ })).toHaveAttribute("href", "/blog/recipes");
		// Unlinked post is an <article>, not a link.
		expect(screen.queryByRole("link", { name: /Theming with tokens/ })).not.toBeInTheDocument();
	});
});
