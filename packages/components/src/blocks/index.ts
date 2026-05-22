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

// Marketing section blocks — composable pieces of a landing page.
export { MarketingHero, type MarketingHeroProps } from "./marketing-hero/marketing-hero.js";
export {
	MarketingFeatureGrid,
	type MarketingFeature,
	type MarketingFeatureGridProps,
} from "./marketing-feature-grid/marketing-feature-grid.js";
export { MarketingCta, type MarketingCtaProps } from "./marketing-cta/marketing-cta.js";
export {
	MarketingLogoCloud,
	type MarketingLogoCloudProps,
} from "./marketing-logo-cloud/marketing-logo-cloud.js";
export {
	MarketingPricing,
	type MarketingPricingProps,
	type MarketingPricingTier,
} from "./marketing-pricing/marketing-pricing.js";
export {
	MarketingTestimonial,
	type MarketingTestimonialItem,
	type MarketingTestimonialProps,
} from "./marketing-testimonial/marketing-testimonial.js";
export {
	MarketingHeader,
	type MarketingHeaderProps,
	type MarketingNavLink,
} from "./marketing-header/marketing-header.js";
export {
	MarketingFooter,
	type MarketingFooterColumn,
	type MarketingFooterLink,
	type MarketingFooterProps,
} from "./marketing-footer/marketing-footer.js";
