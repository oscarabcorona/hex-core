/* eslint-disable @typescript-eslint/no-empty-function */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthAdapter } from "../_shared/auth-adapter.js";
import { AuthForgotPassword } from "./auth-forgot-password.js";

describe("AuthForgotPassword", () => {
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

	it("calls adapter.requestPasswordReset with the typed email", async () => {
		const user = userEvent.setup();
		const requestPasswordReset = vi.fn(async () => ({ ok: true }));
		const onSuccess = vi.fn();
		render(
			<AuthForgotPassword
				adapter={buildAdapter({ requestPasswordReset })}
				onSuccess={onSuccess}
			/>,
		);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.click(screen.getByRole("button", { name: /send reset link/i }));

		await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledTimes(1));
		expect(requestPasswordReset).toHaveBeenCalledWith({ email: "ada@example.com" });
		expect(onSuccess).toHaveBeenCalledTimes(1);
	});

	it("swaps to the 'check your inbox' confirmation state on success", async () => {
		const user = userEvent.setup();
		const requestPasswordReset = vi.fn(async () => ({ ok: true }));
		render(<AuthForgotPassword adapter={buildAdapter({ requestPasswordReset })} />);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.click(screen.getByRole("button", { name: /send reset link/i }));

		await screen.findByRole("region", { name: /check your inbox/i });
		expect(screen.getByText(/ada@example.com/i)).toBeInTheDocument();
		expect(screen.queryByLabelText(/email/i)).toBeNull();
		expect(screen.getByRole("link", { name: /back to sign in/i })).toBeInTheDocument();
	});

	it("rejects malformed email without calling the adapter", async () => {
		const user = userEvent.setup();
		const requestPasswordReset = vi.fn();
		render(<AuthForgotPassword adapter={buildAdapter({ requestPasswordReset })} />);

		await user.type(screen.getByLabelText(/email/i), "not-an-email");
		await user.click(screen.getByRole("button", { name: /send reset link/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/valid email/i);
		expect(requestPasswordReset).not.toHaveBeenCalled();
	});

	it("renders the adapter's error.message when the dispatch fails", async () => {
		const user = userEvent.setup();
		const requestPasswordReset = vi.fn(async () => ({
			ok: false,
			error: { code: "rate_limited", message: "Too many attempts. Try again in a minute." },
		}));
		render(<AuthForgotPassword adapter={buildAdapter({ requestPasswordReset })} />);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.click(screen.getByRole("button", { name: /send reset link/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/too many attempts/i);
	});

	it("falls back to a generic message + console.warn when requestPasswordReset is unimplemented", async () => {
		const user = userEvent.setup();
		render(<AuthForgotPassword adapter={buildAdapter()} />);

		await user.type(screen.getByLabelText(/email/i), "ada@example.com");
		await user.click(screen.getByRole("button", { name: /send reset link/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/currently unavailable/i);
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[AuthForgotPassword]"));
	});
});
