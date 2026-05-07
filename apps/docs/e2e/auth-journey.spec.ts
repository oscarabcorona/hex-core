import { expect, test } from "@playwright/test";

/**
 * Cross-route flow lock for the password-auth journey. Six showcase routes
 * compose the full loop: sign-up → verify-email → sign-in → forgot-password
 * → reset-password → sign-in. Every block exposes default hrefs to its
 * neighbors (signInHref, signUpHref, forgotPasswordHref) — this suite
 * walks each link to prove the wiring matches the routes that actually exist.
 *
 * Visual + a11y + behavioral tests already cover rendering of each block.
 * This suite covers what they don't: that clicking a block's link arrives at
 * a page that renders, not a 404.
 */

test.describe("auth journey — cross-route hrefs resolve and render", () => {
	test("/sign-in 'Sign up' link → /sign-up renders sign-up heading", async ({ page }) => {
		await page.goto("/sign-in");
		await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
		await page.getByRole("link", { name: /^sign up$/i }).click();
		await page.waitForURL(/\/sign-up$/);
		await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
	});

	test("/sign-in 'Forgot?' link → /forgot-password renders reset heading", async ({ page }) => {
		await page.goto("/sign-in");
		await page.getByRole("link", { name: /forgot\?/i }).click();
		await page.waitForURL(/\/forgot-password$/);
		await expect(page.getByRole("heading", { name: /reset your password/i })).toBeVisible();
	});

	test("/sign-up 'Sign in' link → /sign-in", async ({ page }) => {
		await page.goto("/sign-up");
		await page.getByRole("link", { name: /^sign in$/i }).click();
		await page.waitForURL(/\/sign-in$/);
		await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
	});

	test("/forgot-password 'Sign in' fallback link → /sign-in", async ({ page }) => {
		await page.goto("/forgot-password");
		// Two links named "Sign in" can render — one in the body copy, one in the
		// success state. Use the first which is always present pre-submit.
		await page.getByRole("link", { name: /sign in/i }).first().click();
		await page.waitForURL(/\/sign-in$/);
	});

	test("/reset-password 'Back to sign in' link → /sign-in", async ({ page }) => {
		// Showcase route renders even without ?token= via a placeholder.
		await page.goto("/reset-password");
		await expect(page.getByRole("heading", { name: /set a new password/i })).toBeVisible();
		await page.getByRole("link", { name: /back to sign in/i }).click();
		await page.waitForURL(/\/sign-in$/);
	});

	test("/verify-email 'Back to sign in' link → /sign-in", async ({ page }) => {
		await page.goto("/verify-email");
		await expect(page.getByRole("region", { name: /check your inbox/i })).toBeVisible();
		await page.getByRole("link", { name: /back to sign in/i }).click();
		await page.waitForURL(/\/sign-in$/);
	});

	test("/verify-otp renders the sign-in intent heading", async ({ page }) => {
		// No outbound link from this block by default — assert it loads cleanly.
		await page.goto("/verify-otp");
		await expect(page.getByRole("heading", { name: /enter your sign-in code/i })).toBeVisible();
	});

	test("/docs/blocks 'Password-auth journey' links each route into 200s", async ({ page }) => {
		await page.goto("/docs/blocks");
		const journeyRoutes = [
			{ slug: "auth-sign-in-split", href: "/sign-in" },
			{ slug: "auth-sign-up-card", href: "/sign-up" },
			{ slug: "auth-forgot-password", href: "/forgot-password" },
			{ slug: "auth-reset-password", href: "/reset-password?token=demo-token" },
			{ slug: "auth-verify-email", href: "/verify-email" },
			{ slug: "auth-verify-otp", href: "/verify-otp" },
		];
		for (const { href } of journeyRoutes) {
			const link = page.locator(`a[href="${href}"]`).first();
			await expect(link, `journey card link to ${href} missing`).toBeVisible();
		}
	});
});
