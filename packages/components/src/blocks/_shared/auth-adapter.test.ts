import { describe, expect, it } from "vitest";
import { mockAuthAdapter, type AuthAdapter } from "./auth-adapter.js";

describe("AuthAdapter contract", () => {
	it("treats every method as optional so consumers can ship partial implementations", () => {
		const passwordOnly: AuthAdapter = {
			async signInWithPassword({ email }) {
				return { ok: true, redirect: `/welcome/${email.split("@")[0]}` };
			},
		};
		expect(passwordOnly.signInWithPassword).toBeTypeOf("function");
		expect(passwordOnly.signInWithPasskey).toBeUndefined();
	});
});

describe("mockAuthAdapter", () => {
	it("resolves every method with ok:true so docs showcase routes can render the happy path", async () => {
		const r1 = await mockAuthAdapter.signInWithPassword({
			email: "a@b.co",
			password: "x",
			remember: true,
		});
		expect(r1.ok).toBe(true);
		expect(r1.redirect).toBe("/app");

		const r2 = await mockAuthAdapter.signUpWithPassword({ email: "a@b.co", password: "x" });
		expect(r2.ok).toBe(true);
		expect(r2.redirect).toBe("/verify-email");

		const r3 = await mockAuthAdapter.signInWithSocial({ provider: "github" });
		expect(r3.ok).toBe(true);
		expect(r3.redirect).toBe("/oauth/github/callback");

		const r4 = await mockAuthAdapter.sendMagicLink({ email: "a@b.co" });
		expect(r4.ok).toBe(true);
		expect(r4.redirect).toBeUndefined();

		const r5 = await mockAuthAdapter.verifyOtp({ code: "123456", intent: "mfa" });
		expect(r5.ok).toBe(true);

		const r6 = await mockAuthAdapter.requestPasswordReset({ email: "a@b.co" });
		expect(r6.ok).toBe(true);

		const r7 = await mockAuthAdapter.resetPassword({ token: "t", password: "x" });
		expect(r7.ok).toBe(true);
		expect(r7.redirect).toBe("/sign-in");

		const r8 = await mockAuthAdapter.registerPasskey();
		expect(r8.ok).toBe(true);

		const r9 = await mockAuthAdapter.signInWithPasskey();
		expect(r9.ok).toBe(true);
	});
});
