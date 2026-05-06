import { expect, test } from "@playwright/test";

test.describe("skills page", () => {
	test("renders heading + all section anchors", async ({ page }) => {
		await page.goto("/docs/skills");
		await expect(page.getByRole("heading", { name: "Skills", level: 1 })).toBeVisible();

		const sectionTitles = [
			"Why skills",
			"Install",
			"The eight shipped",
			"Authoring your own",
		];
		for (const title of sectionTitles) {
			await expect(page.getByRole("heading", { name: title, level: 2 })).toBeVisible();
		}
	});

	test("lists all eight shipped skills by slug", async ({ page }) => {
		await page.goto("/docs/skills");
		const shippedSection = page.locator("#shipped");
		const slugs = [
			"hex-core-overview",
			"hex-core-mcp-tools",
			"hex-core-recipes-workflow",
			"hex-core-theming",
			"hex-core-cli",
			"hex-core-accessibility",
			"hex-core-anti-patterns",
			"hex-core-registry-authoring",
		];
		for (const slug of slugs) {
			await expect(shippedSection.getByText(slug, { exact: true })).toBeVisible();
		}
	});

	test("sidebar exposes Skills link under Getting Started", async ({ page }) => {
		await page.goto("/docs/skills");
		const link = page.locator('aside nav a[href="/docs/skills"]');
		await expect(link).toBeVisible();
		await expect(link).toHaveClass(/font-medium/);
	});
});
