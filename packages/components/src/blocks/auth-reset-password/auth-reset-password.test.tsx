/* eslint-disable @typescript-eslint/no-empty-function */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthAdapter } from "../_shared/auth-adapter.js";
import { AuthResetPassword } from "./auth-reset-password.js";

describe("AuthResetPassword", () => {
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

	it("forwards the opaque token to adapter.resetPassword unchanged", async () => {
		const user = userEvent.setup();
		const resetPassword = vi.fn(async () => ({ ok: true, redirect: "/sign-in" }));
		const onSuccess = vi.fn();
		render(
			<AuthResetPassword
				adapter={buildAdapter({ resetPassword })}
				token="opaque-server-token-abc123"
				onSuccess={onSuccess}
			/>,
		);

		await user.type(screen.getByLabelText(/^new password$/i), "hunter2pw");
		await user.type(screen.getByLabelText(/confirm new password/i), "hunter2pw");
		await user.click(screen.getByRole("button", { name: /save new password/i }));

		await waitFor(() => expect(resetPassword).toHaveBeenCalledTimes(1));
		expect(resetPassword).toHaveBeenCalledWith({
			token: "opaque-server-token-abc123",
			password: "hunter2pw",
		});
		expect(onSuccess).toHaveBeenCalledWith("/sign-in");
	});

	it("rejects mismatched passwords without calling the adapter", async () => {
		const user = userEvent.setup();
		const resetPassword = vi.fn();
		render(
			<AuthResetPassword
				adapter={buildAdapter({ resetPassword })}
				token="t"
			/>,
		);

		await user.type(screen.getByLabelText(/^new password$/i), "hunter2pw");
		await user.type(screen.getByLabelText(/confirm new password/i), "different1");
		await user.click(screen.getByRole("button", { name: /save new password/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/don.?t match/i);
		expect(resetPassword).not.toHaveBeenCalled();
	});

	it("rejects passwords shorter than passwordMinLength", async () => {
		const user = userEvent.setup();
		const resetPassword = vi.fn();
		render(
			<AuthResetPassword
				adapter={buildAdapter({ resetPassword })}
				token="t"
				passwordMinLength={12}
			/>,
		);

		await user.type(screen.getByLabelText(/^new password$/i), "shortpw");
		await user.type(screen.getByLabelText(/confirm new password/i), "shortpw");
		await user.click(screen.getByRole("button", { name: /save new password/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/at least 12 characters/i);
		expect(resetPassword).not.toHaveBeenCalled();
	});

	it("surfaces a friendly error when the token is empty", async () => {
		const user = userEvent.setup();
		const resetPassword = vi.fn();
		render(<AuthResetPassword adapter={buildAdapter({ resetPassword })} token="" />);

		await user.type(screen.getByLabelText(/^new password$/i), "hunter2pw");
		await user.type(screen.getByLabelText(/confirm new password/i), "hunter2pw");
		await user.click(screen.getByRole("button", { name: /save new password/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/invalid or expired/i);
		expect(resetPassword).not.toHaveBeenCalled();
	});

	it("renders the adapter's error.message when reset fails", async () => {
		const user = userEvent.setup();
		const resetPassword = vi.fn(async () => ({
			ok: false,
			error: { code: "token_expired", message: "This link has expired. Request a new one." },
		}));
		render(<AuthResetPassword adapter={buildAdapter({ resetPassword })} token="t" />);

		await user.type(screen.getByLabelText(/^new password$/i), "hunter2pw");
		await user.type(screen.getByLabelText(/confirm new password/i), "hunter2pw");
		await user.click(screen.getByRole("button", { name: /save new password/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/this link has expired/i);
	});

	it("falls back to a generic message + console.warn when resetPassword is unimplemented", async () => {
		const user = userEvent.setup();
		render(<AuthResetPassword adapter={buildAdapter()} token="t" />);

		await user.type(screen.getByLabelText(/^new password$/i), "hunter2pw");
		await user.type(screen.getByLabelText(/confirm new password/i), "hunter2pw");
		await user.click(screen.getByRole("button", { name: /save new password/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/currently unavailable/i);
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[AuthResetPassword]"));
	});
});
