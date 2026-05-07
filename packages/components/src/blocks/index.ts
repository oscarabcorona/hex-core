export type {
	AuthAdapter,
	AuthAdapterResult,
	AuthOtpIntent,
	AuthSocialProvider,
} from "./_shared/auth-adapter.js";
export { mockAuthAdapter } from "./_shared/auth-adapter.js";

export {
	AuthSignInSplit,
	type AuthSignInSplitProps,
	type AuthSignInSocialProvider,
} from "./auth-sign-in-split/auth-sign-in-split.js";

export {
	AuthSignUpCard,
	type AuthSignUpCardProps,
	type AuthSignUpCardSocialProvider,
} from "./auth-sign-up-card/auth-sign-up-card.js";

export {
	AuthForgotPassword,
	type AuthForgotPasswordProps,
} from "./auth-forgot-password/auth-forgot-password.js";

export {
	AuthResetPassword,
	type AuthResetPasswordProps,
} from "./auth-reset-password/auth-reset-password.js";

export {
	AuthVerifyEmail,
	type AuthVerifyEmailProps,
} from "./auth-verify-email/auth-verify-email.js";

export {
	AuthVerifyOtp,
	type AuthVerifyOtpProps,
} from "./auth-verify-otp/auth-verify-otp.js";
