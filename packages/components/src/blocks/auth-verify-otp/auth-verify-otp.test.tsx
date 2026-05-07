/* eslint-disable @typescript-eslint/no-empty-function */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthAdapter } from "../_shared/auth-adapter.js";
import { AuthVerifyOtp } from "./auth-verify-otp.js";

describe("AuthVerifyOtp", () => {
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

	function getOtpInput() {
		// input-otp renders a hidden <input> with maxLength + role textbox-like
		// behavior. Fall back to grabbing it by accessible name.
		return screen.getByLabelText(/one-time code/i) as HTMLInputElement;
	}

	it("auto-submits when the code reaches `length`", async () => {
		const user = userEvent.setup();
		const verifyOtp = vi.fn(async () => ({ ok: true, redirect: "/app" }));
		const onSuccess = vi.fn();
		render(
			<AuthVerifyOtp
				adapter={buildAdapter({ verifyOtp })}
				intent="sign-in"
				onSuccess={onSuccess}
			/>,
		);

		await user.type(getOtpInput(), "123456");

		await waitFor(() => expect(verifyOtp).toHaveBeenCalledTimes(1));
		expect(verifyOtp).toHaveBeenCalledWith({ code: "123456", intent: "sign-in" });
		expect(onSuccess).toHaveBeenCalledWith("/app");
	});

	it("does NOT submit until the code is full", async () => {
		const user = userEvent.setup();
		const verifyOtp = vi.fn(async () => ({ ok: true }));
		render(
			<AuthVerifyOtp adapter={buildAdapter({ verifyOtp })} intent="verify-email" />,
		);

		await user.type(getOtpInput(), "12345");
		// 5 digits — auto-submit shouldn't fire yet.
		expect(verifyOtp).not.toHaveBeenCalled();
	});

	it("forwards the configurable length to the adapter", async () => {
		const user = userEvent.setup();
		const verifyOtp = vi.fn(async () => ({ ok: true }));
		render(
			<AuthVerifyOtp
				adapter={buildAdapter({ verifyOtp })}
				intent="mfa"
				length={4}
			/>,
		);

		await user.type(getOtpInput(), "9876");

		await waitFor(() => expect(verifyOtp).toHaveBeenCalledTimes(1));
		expect(verifyOtp).toHaveBeenCalledWith({ code: "9876", intent: "mfa" });
	});

	it("clears the code and shows the adapter's error.message on failure", async () => {
		const user = userEvent.setup();
		const verifyOtp = vi.fn(async () => ({
			ok: false,
			error: { code: "invalid_code", message: "That code is wrong or expired." },
		}));
		render(<AuthVerifyOtp adapter={buildAdapter({ verifyOtp })} intent="sign-in" />);

		await user.type(getOtpInput(), "123456");

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/wrong or expired/i);
		await waitFor(() => expect((getOtpInput() as HTMLInputElement).value).toBe(""));
	});

	it("falls back to a generic message + console.warn when verifyOtp is unimplemented", async () => {
		const user = userEvent.setup();
		render(<AuthVerifyOtp adapter={buildAdapter()} intent="sign-in" />);

		await user.type(getOtpInput(), "123456");

		const alert = await screen.findByRole("alert");
		expect(alert).toHaveTextContent(/currently unavailable/i);
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("[AuthVerifyOtp]"));
	});

	it("hides the resend button when adapter.resendOtp is unimplemented", () => {
		render(<AuthVerifyOtp adapter={buildAdapter()} intent="sign-in" />);
		expect(screen.queryByRole("button", { name: /resend/i })).toBeNull();
	});

	it("calls adapter.resendOtp with the same intent and starts cooldown", async () => {
		const user = userEvent.setup();
		const resendOtp = vi.fn(async () => ({ ok: true }));
		render(
			<AuthVerifyOtp
				adapter={buildAdapter({ resendOtp })}
				intent="verify-email"
				resendCooldownSeconds={30}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /resend code/i }));

		await waitFor(() => expect(resendOtp).toHaveBeenCalledTimes(1));
		expect(resendOtp).toHaveBeenCalledWith({ intent: "verify-email" });
		const cooldown = await screen.findByRole("button", { name: /resend in/i });
		expect(cooldown).toBeDisabled();
	});
});
