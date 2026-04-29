import { expect, test } from "@playwright/test";

test.describe("docs chrome", () => {
	test("/docs index renders the populated category sections", async ({ page }) => {
		await page.goto("/docs");
		await expect(page.getByRole("heading", { name: "Components", level: 1 })).toBeVisible();
		// Registry currently ships 3 populated categories (Primitives + AI +
		// Components); Blocks/Hooks are declared but unpopulated so their
		// sections don't render. Assert exact names + order so a silent drop
		// or reorder is caught.
		const categories = page.locator("main h2");
		await expect(categories).toHaveText(["Primitives", "AI", "Components"]);
	});

	test("sidebar navigation + active highlight", async ({ page }) => {
		await page.goto("/docs/components/button");
		const buttonLink = page.locator('aside nav a[href="/docs/components/button"]');
		await expect(buttonLink).toBeVisible();
		await expect(buttonLink).toHaveClass(/font-medium/);
	});

	test("theme toggle flips html.dark", async ({ page }) => {
		await page.goto("/docs/components/button");
		const html = page.locator("html");

		// Wait for next-themes' inline script to hydrate the class attribute so
		// `before` is stable before the first click.
		await expect(html).toHaveClass(/\b(light|dark)\b/);
		const before = await html.getAttribute("class");

		await page.getByRole("button", { name: /switch to (dark|light) theme/i }).click();
		await expect
			.poll(async () => html.getAttribute("class"))
			.not.toBe(before);
	});
});
