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
