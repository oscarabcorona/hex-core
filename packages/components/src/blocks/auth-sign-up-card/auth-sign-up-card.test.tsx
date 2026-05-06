/* eslint-disable @typescript-eslint/no-empty-function */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthAdapter } from "../_shared/auth-adapter.js";
import { AuthSignUpCard } from "./auth-sign-up-card.js";

describe("AuthSignUpCard", () => {
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

	async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.type(screen.getByLabelText(/^password$/i), "hunter2pw");
		await user.type(screen.getByLabelText(/confirm password/i), "hunter2pw");
		await user.click(screen.getByLabelText(/i agree to the/i));
	}

	it("renders email + password + confirm + terms checkbox with proper labels", () => {
		render(<AuthSignUpCard adapter={buildAdapter()} />);
		expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
		expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "password");
		expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute("type", "password");
		expect(screen.getByLabelText(/i agree to the/i)).toBeInTheDocument();
	});

	it("calls adapter.signUpWithPassword with form values on submit", async () => {
		const user = userEvent.setup();
		const signUpWithPassword = vi.fn(async () => ({ ok: true, redirect: "/verify-email" }));
		const onSuccess = vi.fn();
		render(
			<AuthSignUpCard adapter={buildAdapter({ signUpWithPassword })} onSuccess={onSuccess} />,
		);
		await fillValidForm(user);
		await user.click(screen.getByRole("button", { name: /create account/i }));

		await waitFor(() => expect(signUpWithPassword).toHaveBeenCalledTimes(1));
		expect(signUpWithPassword).toHaveBeenCalledWith({
			email: "ada@example.com",
			password: "hunter2pw",
			name: undefined,
		});
		expect(onSuccess).toHaveBeenCalledWith("/verify-email");
	});

	it("forwards trimmed name when provided", async () => {
		const user = userEvent.setup();
		const signUpWithPassword = vi.fn(async () => ({ ok: true }));
		render(<AuthSignUpCard adapter={buildAdapter({ signUpWithPassword })} />);

		await user.type(screen.getByLabelText(/full name/i), "  Ada Lovelace  ");
		await fillValidForm(user);
		await user.click(screen.getByRole("button", { name: /create account/i }));

		await waitFor(() => expect(signUpWithPassword).toHaveBeenCalledTimes(1));
		expect(signUpWithPassword).toHaveBeenCalledWith(
			expect.objectContaining({ name: "Ada Lovelace" }),
		);
	});

	it("rejects mismatched passwords without calling the adapter", async () => {
		const user = userEvent.setup();
		const signUpWithPassword = vi.fn();
		render(<AuthSignUpCard adapter={buildAdapter({ signUpWithPassword })} />);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.type(screen.getByLabelText(/^password$/i), "hunter2pw");
		await user.type(screen.getByLabelText(/confirm password/i), "different1");
		await user.click(screen.getByLabelText(/i agree to the/i));
		await user.click(screen.getByRole("button", { name: /create account/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/don.?t match/i);
		expect(signUpWithPassword).not.toHaveBeenCalled();
	});

	it("rejects passwords shorter than passwordMinLength", async () => {
		const user = userEvent.setup();
		const signUpWithPassword = vi.fn();
		render(
			<AuthSignUpCard
				adapter={buildAdapter({ signUpWithPassword })}
				passwordMinLength={10}
			/>,
		);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.type(screen.getByLabelText(/^password$/i), "shortpw");
		await user.type(screen.getByLabelText(/confirm password/i), "shortpw");
		await user.click(screen.getByLabelText(/i agree to the/i));
		await user.click(screen.getByRole("button", { name: /create account/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/at least 10 characters/i);
		expect(signUpWithPassword).not.toHaveBeenCalled();
	});

	it("blocks submission until the terms checkbox is checked", async () => {
		const user = userEvent.setup();
		const signUpWithPassword = vi.fn();
		render(<AuthSignUpCard adapter={buildAdapter({ signUpWithPassword })} />);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.type(screen.getByLabelText(/^password$/i), "hunter2pw");
		await user.type(screen.getByLabelText(/confirm password/i), "hunter2pw");
		// Skip the terms click
		await user.click(screen.getByRole("button", { name: /create account/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/terms of service/i);
		expect(signUpWithPassword).not.toHaveBeenCalled();
	});

	it("renders the adapter's error.message in the Alert when sign-up fails", async () => {
		const user = userEvent.setup();
		const signUpWithPassword = vi.fn(async () => ({
			ok: false,
			error: { code: "email_in_use", message: "That email is already registered." },
		}));
		render(<AuthSignUpCard adapter={buildAdapter({ signUpWithPassword })} />);

		await fillValidForm(user);
		await user.click(screen.getByRole("button", { name: /create account/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/already registered/i);
	});

	it("falls back to a generic message + console.warn when signUpWithPassword is unimplemented", async () => {
		const user = userEvent.setup();
		render(<AuthSignUpCard adapter={buildAdapter()} />);

		await fillValidForm(user);
		await user.click(screen.getByRole("button", { name: /create account/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/currently unavailable/i);
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[AuthSignUpCard]"));
	});

	it("calls adapter.signInWithSocial when a social provider button is clicked", async () => {
		const user = userEvent.setup();
		const signInWithSocial = vi.fn(async ({ provider }: { provider: string }) => ({
			ok: true,
			redirect: `/oauth/${provider}/callback`,
		}));
		const onSuccess = vi.fn();
		render(
			<AuthSignUpCard
				adapter={buildAdapter({ signInWithSocial })}
				socialProviders={[
					{ provider: "github", label: "GitHub" },
					{ provider: "google", label: "Google" },
				]}
				onSuccess={onSuccess}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /continue with github/i }));

		await waitFor(() => expect(signInWithSocial).toHaveBeenCalledTimes(1));
		expect(signInWithSocial).toHaveBeenCalledWith({ provider: "github" });
		expect(onSuccess).toHaveBeenCalledWith("/oauth/github/callback");
	});
});
