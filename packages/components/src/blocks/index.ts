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

// Application section blocks — composable pieces of an authenticated app.
export { AppShell, type AppShellProps } from "./app-shell/app-shell.js";
export {
	AppSidebarNav,
	type AppNavGroup,
	type AppNavItem,
	type AppSidebarNavProps,
} from "./app-sidebar-nav/app-sidebar-nav.js";
export { AppStats, type AppStat, type AppStatsProps } from "./app-stats/app-stats.js";
export {
	AppSettings,
	type AppSettingsGroup,
	type AppSettingsProps,
} from "./app-settings/app-settings.js";
export { AppDataTable, type AppDataTableProps } from "./app-data-table/app-data-table.js";

// Ecommerce section blocks — composable pieces of a storefront.
export {
	CommerceProductGrid,
	type CommerceProduct,
	type CommerceProductGridProps,
} from "./commerce-product-grid/commerce-product-grid.js";
export {
	CommerceProductDetail,
	type CommerceProductDetailProps,
} from "./commerce-product-detail/commerce-product-detail.js";
export {
	CommerceReviews,
	type CommerceReview,
	type CommerceReviewsProps,
} from "./commerce-reviews/commerce-reviews.js";
export {
	CommerceCart,
	type CommerceCartItem,
	type CommerceCartProps,
} from "./commerce-cart/commerce-cart.js";
export {
	CommerceCheckout,
	type CommerceCheckoutProps,
} from "./commerce-checkout/commerce-checkout.js";

// Marketing backfill (round 2): stats, faq, team, newsletter, contact, content.
export { MarketingStats, type MarketingStat, type MarketingStatsProps } from "./marketing-stats/marketing-stats.js";
export {
	MarketingFaq,
	type MarketingFaqItem,
	type MarketingFaqProps,
} from "./marketing-faq/marketing-faq.js";
export {
	MarketingTeam,
	type MarketingTeamMember,
	type MarketingTeamProps,
} from "./marketing-team/marketing-team.js";
export {
	MarketingNewsletter,
	type MarketingNewsletterProps,
} from "./marketing-newsletter/marketing-newsletter.js";
export {
	MarketingContact,
	type MarketingContactProps,
} from "./marketing-contact/marketing-contact.js";
export {
	MarketingContent,
	type MarketingContentPost,
	type MarketingContentProps,
} from "./marketing-content/marketing-content.js";

// Catalog backfill (round 3): closes the strategy doc.
export {
	MarketingBento,
	type MarketingBentoProps,
	type MarketingBentoTile,
} from "./marketing-bento/marketing-bento.js";
export {
	AppStackedList,
	type AppStackedListItem,
	type AppStackedListProps,
} from "./app-stacked-list/app-stacked-list.js";
export {
	AppGridList,
	type AppGridListItem,
	type AppGridListProps,
} from "./app-grid-list/app-grid-list.js";
export {
	AppFeed,
	type AppFeedEvent,
	type AppFeedGroup,
	type AppFeedProps,
} from "./app-feed/app-feed.js";
export {
	CommerceCategory,
	type CommerceCategoryItem,
	type CommerceCategoryProps,
} from "./commerce-category/commerce-category.js";
export {
	CommerceCategoryFilters,
	type CommerceCategoryFiltersProps,
	type CommerceFilterGroup,
} from "./commerce-category-filters/commerce-category-filters.js";
export {
	CommerceStoreNav,
	type CommerceStoreCategory,
	type CommerceStoreNavProps,
} from "./commerce-store-nav/commerce-store-nav.js";
export {
	CommerceProductFeatures,
	type CommerceProductFeature,
	type CommerceProductFeaturesProps,
} from "./commerce-product-features/commerce-product-features.js";
export {
	CommerceQuickview,
	type CommerceQuickviewProps,
} from "./commerce-quickview/commerce-quickview.js";
export {
	CommerceIncentives,
	type CommerceIncentive,
	type CommerceIncentivesProps,
} from "./commerce-incentives/commerce-incentives.js";
export {
	CommercePromo,
	type CommercePromoProps,
} from "./commerce-promo/commerce-promo.js";
export {
	CommerceOrderSummary,
	type CommerceOrderItem,
	type CommerceOrderSummaryProps,
	type CommerceOrderTotal,
} from "./commerce-order-summary/commerce-order-summary.js";
export {
	CommerceOrderHistory,
	type CommerceOrderHistoryProps,
	type CommerceOrderRow,
} from "./commerce-order-history/commerce-order-history.js";
