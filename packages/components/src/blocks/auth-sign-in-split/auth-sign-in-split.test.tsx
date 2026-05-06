/* eslint-disable @typescript-eslint/no-empty-function */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthAdapter } from "../_shared/auth-adapter.js";
import { AuthSignInSplit } from "./auth-sign-in-split.js";

const SOCIAL_PROVIDERS = [
	{ provider: "github", label: "GitHub" },
	{ provider: "google", label: "Google" },
] as const;

describe("AuthSignInSplit", () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
	});
	afterEach(() => {
		warnSpy.mockRestore();
	});

	function buildAdapter(overrides: Partial<AuthAdapter> = {}): AuthAdapter {
		return overrides;
	}

	it("renders email + password fields wired to labels via htmlFor", () => {
		render(<AuthSignInSplit adapter={buildAdapter()} />);
		const email = screen.getByLabelText(/email/i) as HTMLInputElement;
		const password = screen.getByLabelText(/password/i) as HTMLInputElement;
		expect(email.type).toBe("email");
		expect(email.autocomplete).toBe("email");
		expect(password.type).toBe("password");
		expect(password.autocomplete).toBe("current-password");
	});

	it("calls adapter.signInWithPassword with form values + remember on submit", async () => {
		const user = userEvent.setup();
		const signInWithPassword = vi.fn(async () => ({ ok: true, redirect: "/app" }));
		const onSuccess = vi.fn();
		render(
			<AuthSignInSplit
				adapter={buildAdapter({ signInWithPassword })}
				onSuccess={onSuccess}
			/>,
		);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.type(screen.getByLabelText(/password/i), "hunter2");
		await user.click(screen.getByLabelText(/remember me on this device/i));
		await user.click(screen.getByRole("button", { name: /^sign in$/i }));

		await waitFor(() => expect(signInWithPassword).toHaveBeenCalledTimes(1));
		expect(signInWithPassword).toHaveBeenCalledWith({
			email: "ada@example.com",
			password: "hunter2",
			remember: true,
		});
		expect(onSuccess).toHaveBeenCalledWith("/app");
	});

	it("renders the adapter's error.message in an Alert when sign-in fails", async () => {
		const user = userEvent.setup();
		const signInWithPassword = vi.fn(async () => ({
			ok: false,
			error: { code: "invalid_credentials", message: "Wrong email or password." },
		}));
		render(<AuthSignInSplit adapter={buildAdapter({ signInWithPassword })} />);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.type(screen.getByLabelText(/password/i), "nope");
		await user.click(screen.getByRole("button", { name: /^sign in$/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/wrong email or password/i);
	});

	it("falls back to a generic message + console.warn when signInWithPassword is unimplemented", async () => {
		const user = userEvent.setup();
		render(<AuthSignInSplit adapter={buildAdapter()} />);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.type(screen.getByLabelText(/password/i), "x");
		await user.click(screen.getByRole("button", { name: /^sign in$/i }));

		const alert = await screen.findByRole("alert");
		expect(alert.textContent ?? "").not.toMatch(/not configured|unimplemented/i);
		expect(alert).toHaveTextContent(/currently unavailable/i);
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining("[AuthSignInSplit]"),
		);
	});

	it("calls adapter.signInWithSocial with the provider when a social button is clicked", async () => {
		const user = userEvent.setup();
		const signInWithSocial = vi.fn(async ({ provider }: { provider: string }) => ({
			ok: true,
			redirect: `/oauth/${provider}/callback`,
		}));
		const onSuccess = vi.fn();
		render(
			<AuthSignInSplit
				adapter={buildAdapter({ signInWithSocial })}
				socialProviders={SOCIAL_PROVIDERS}
				onSuccess={onSuccess}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /continue with github/i }));

		await waitFor(() => expect(signInWithSocial).toHaveBeenCalledTimes(1));
		expect(signInWithSocial).toHaveBeenCalledWith({ provider: "github" });
		expect(onSuccess).toHaveBeenCalledWith("/oauth/github/callback");
	});

	it("renders no social section when socialProviders is omitted (no 'or' divider)", () => {
		render(<AuthSignInSplit adapter={buildAdapter()} />);
		expect(
			screen.queryByRole("button", { name: /continue with/i }),
		).toBeNull();
	});

	it("disables every interactive control while a submit is in flight", async () => {
		const user = userEvent.setup();
		// Slow adapter so the disabled state is observable
		let resolveSignIn: (v: { ok: true }) => void = () => {};
		const signInWithPassword = vi.fn(
			() =>
				new Promise<{ ok: true }>((resolve) => {
					resolveSignIn = resolve;
				}),
		);
		render(
			<AuthSignInSplit
				adapter={buildAdapter({ signInWithPassword })}
				socialProviders={SOCIAL_PROVIDERS}
			/>,
		);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.type(screen.getByLabelText(/password/i), "hunter2");
		await user.click(screen.getByRole("button", { name: /^sign in$/i }));

		const submit = screen.getByRole("button", { name: /signing in/i });
		const github = screen.getByRole("button", { name: /continue with github/i });
		expect(submit).toBeDisabled();
		expect(github).toBeDisabled();
		expect(submit).toHaveAttribute("aria-busy", "true");

		// Resolve so React doesn't complain about un-acted updates
		resolveSignIn({ ok: true });
		await waitFor(() => expect(signInWithPassword).toHaveBeenCalledTimes(1));
	});
});
