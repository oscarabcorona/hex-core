/**
 * The contract every Hex Core auth block consumes via its `adapter` prop.
 *
 * Hex Core does not ship session management — auth blocks are presentation-
 * only and delegate every credential, OTP, and OAuth handoff to whatever
 * the consumer wires up (better-auth, Clerk, NextAuth, Supabase Auth, a
 * custom server, …). The adapter is the single seam.
 *
 * Every method is **optional**. A block that needs `signInWithPassword` but
 * not passkeys passes an adapter implementing only the methods it needs;
 * the block surfaces a runtime error if the user hits a code path the
 * adapter doesn't implement, rather than failing to render. This lets a
 * consumer ship password-only on day one and add passkeys later without
 * forking the block source.
 *
 * A reference {@link mockAuthAdapter} lives below — used by the docs
 * showcase routes and unit tests; never ship it in production.
 */
export interface AuthAdapterResult {
	ok: boolean;
	error?: { code: string; message: string };
	redirect?: string;
}

export type AuthSocialProvider = "github" | "google" | "microsoft" | (string & {});

export type AuthOtpIntent = "sign-in" | "verify-email" | "mfa";

export interface AuthAdapter {
	signInWithPassword?(p: {
		email: string;
		password: string;
		remember: boolean;
	}): Promise<AuthAdapterResult>;
	signUpWithPassword?(p: {
		email: string;
		password: string;
		name?: string;
	}): Promise<AuthAdapterResult>;
	signInWithSocial?(p: { provider: AuthSocialProvider }): Promise<AuthAdapterResult>;
	sendMagicLink?(p: { email: string }): Promise<AuthAdapterResult>;
	verifyOtp?(p: { code: string; intent: AuthOtpIntent }): Promise<AuthAdapterResult>;
	requestPasswordReset?(p: { email: string }): Promise<AuthAdapterResult>;
	resetPassword?(p: { token: string; password: string }): Promise<AuthAdapterResult>;
	registerPasskey?(): Promise<AuthAdapterResult>;
	signInWithPasskey?(): Promise<AuthAdapterResult>;
	/**
	 * Re-send a magic link to the same address. Distinct from {@link sendMagicLink}
	 * so consumers can throttle resends and surface different analytics / error
	 * copy for the second-and-onward attempt. Used by the verify-email block.
	 */
	resendMagicLink?(p: { email: string }): Promise<AuthAdapterResult>;
	/**
	 * Re-send a one-time code for the given intent. Distinct from the initial
	 * code dispatch so consumers can throttle and log resends separately. Used
	 * by the verify-otp block.
	 */
	resendOtp?(p: { intent: AuthOtpIntent }): Promise<AuthAdapterResult>;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * In-memory mock adapter for docs showcase + tests. Every method delays
 * 400ms to simulate a network round-trip and resolves `{ ok: true }`. Do
 * not use in production — there is no validation, no persistence, and no
 * security.
 */
export const mockAuthAdapter: Required<AuthAdapter> = {
	async signInWithPassword() {
		await wait(400);
		return { ok: true, redirect: "/app" };
	},
	async signUpWithPassword() {
		await wait(400);
		return { ok: true, redirect: "/verify-email" };
	},
	async signInWithSocial({ provider }) {
		await wait(400);
		return { ok: true, redirect: `/oauth/${provider}/callback` };
	},
	async sendMagicLink() {
		await wait(400);
		return { ok: true };
	},
	async verifyOtp() {
		await wait(400);
		return { ok: true, redirect: "/app" };
	},
	async requestPasswordReset() {
		await wait(400);
		return { ok: true };
	},
	async resetPassword() {
		await wait(400);
		return { ok: true, redirect: "/sign-in" };
	},
	async registerPasskey() {
		await wait(400);
		return { ok: true };
	},
	async signInWithPasskey() {
		await wait(400);
		return { ok: true, redirect: "/app" };
	},
	async resendMagicLink() {
		await wait(400);
		return { ok: true };
	},
	async resendOtp() {
		await wait(400);
		return { ok: true };
	},
};
