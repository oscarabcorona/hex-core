/* eslint-disable @typescript-eslint/no-empty-function */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthAdapter } from "../_shared/auth-adapter.js";
import { AuthVerifyEmail } from "./auth-verify-email.js";

describe("AuthVerifyEmail", () => {
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

	it("renders the email in the description when provided", () => {
		render(
			<AuthVerifyEmail adapter={buildAdapter()} email="ada@example.com" />,
		);
		expect(screen.getByRole("region", { name: /check your inbox/i })).toBeInTheDocument();
		expect(screen.getByText(/ada@example.com/i)).toBeInTheDocument();
	});

	it("hides the resend button when adapter.resendMagicLink is unimplemented", () => {
		render(<AuthVerifyEmail adapter={buildAdapter()} email="ada@example.com" />);
		expect(screen.queryByRole("button", { name: /resend/i })).toBeNull();
	});

	it("hides the resend button when no email is provided", () => {
		const resendMagicLink = vi.fn(async () => ({ ok: true }));
		render(<AuthVerifyEmail adapter={buildAdapter({ resendMagicLink })} />);
		expect(screen.queryByRole("button", { name: /resend/i })).toBeNull();
	});

	it("calls adapter.resendMagicLink with the email and shows confirmation", async () => {
		const user = userEvent.setup();
		const resendMagicLink = vi.fn(async () => ({ ok: true }));
		render(
			<AuthVerifyEmail
				adapter={buildAdapter({ resendMagicLink })}
				email="ada@example.com"
				resendCooldownSeconds={5}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /resend email/i }));

		await waitFor(() => expect(resendMagicLink).toHaveBeenCalledTimes(1));
		expect(resendMagicLink).toHaveBeenCalledWith({ email: "ada@example.com" });
		const banner = await screen.findByText(/we sent another link/i);
		expect(banner).toBeInTheDocument();
	});

	it("disables the resend button during cooldown after a successful resend", async () => {
		const user = userEvent.setup();
		const resendMagicLink = vi.fn(async () => ({ ok: true }));
		render(
			<AuthVerifyEmail
				adapter={buildAdapter({ resendMagicLink })}
				email="ada@example.com"
				resendCooldownSeconds={30}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /resend email/i }));

		const cooldownButton = await screen.findByRole("button", {
			name: /resend available in/i,
		});
		expect(cooldownButton).toBeDisabled();
	});

	it("renders the adapter's error.message when resend fails", async () => {
		const user = userEvent.setup();
		const resendMagicLink = vi.fn(async () => ({
			ok: false,
			error: { code: "rate_limited", message: "Too many requests. Wait a minute." },
		}));
		render(
			<AuthVerifyEmail
				adapter={buildAdapter({ resendMagicLink })}
				email="ada@example.com"
			/>,
		);

		await user.click(screen.getByRole("button", { name: /resend email/i }));

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/too many requests/i);
	});
});
