import { expect, test } from "@playwright/test";

test.describe("spec-driven page", () => {
	test("renders heading + all section anchors", async ({ page }) => {
		await page.goto("/docs/spec-driven");
		await expect(
			page.getByRole("heading", { name: "Spec-driven development", level: 1 }),
		).toBeVisible();

		// Every section from SECTIONS[] should be present as a heading.
		const sectionTitles = [
			"Why spec-driven",
			"The four MCP tools",
			"Recipes",
			"CLI shortcut",
			"How an agent uses this",
		];
		for (const title of sectionTitles) {
			await expect(page.getByRole("heading", { name: title, level: 2 })).toBeVisible();
		}
	});

	test("lists all eight shipped recipes", async ({ page }) => {
		await page.goto("/docs/spec-driven");
		const recipesSection = page.locator("#recipes");
		const slugs = [
			"auth-form",
			"settings-page",
			"pricing-table",
			"data-table-view",
			"confirm-destructive",
			"command-palette",
			"intro-sequence",
			"landing-hero",
		];
		for (const slug of slugs) {
			await expect(recipesSection.getByText(slug, { exact: true })).toBeVisible();
		}
	});

	test("sidebar exposes Spec-driven link under Getting Started", async ({ page }) => {
		await page.goto("/docs/spec-driven");
		const link = page.locator('aside nav a[href="/docs/spec-driven"]');
		await expect(link).toBeVisible();
		await expect(link).toHaveClass(/font-medium/);
	});
});
