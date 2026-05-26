import type { Metadata } from "next";
import {
	Badge,
	Button,
	MarketingCta,
	MarketingFaq,
	MarketingFooter,
	MarketingHeader,
	MarketingHero,
	MarketingPricing,
} from "@hex-core/components";

export const metadata: Metadata = {
	title: { absolute: "Pricing — Hex Core" },
	description:
		"Live showcase of the marketing pricing + FAQ blocks composed into a dedicated pricing page via the pricing-page recipe.",
};

const NAV_LINKS = [
	{ label: "Product", href: "/landing" },
	{ label: "Pricing", href: "/pricing" },
	{ label: "Docs", href: "/docs" },
];

const TIERS = [
	{
		name: "Starter",
		price: "$0",
		period: "/mo",
		description: "For side projects and early prototypes.",
		features: [
			"1 project",
			"Community support",
			"All 43 section blocks",
			"MCP server access",
		],
		cta: (
			<Button variant="outline" asChild>
				<a href="/sign-up">Start free</a>
			</Button>
		),
	},
	{
		name: "Pro",
		price: "$29",
		period: "/mo",
		description: "For growing teams shipping with agents.",
		highlighted: true,
		badge: <Badge>Most popular</Badge>,
		features: [
			"Unlimited projects",
			"Priority support",
			"All page-recipes",
			"Theme presets + token packs",
			"Usage analytics",
		],
		cta: (
			<Button asChild>
				<a href="/sign-up?plan=pro">Choose Pro</a>
			</Button>
		),
	},
	{
		name: "Team",
		price: "$99",
		period: "/mo",
		description: "For organizations with multiple agent fleets.",
		features: [
			"Everything in Pro",
			"SSO & SCIM",
			"Audit log",
			"Dedicated support",
			"Private registry mirror",
		],
		cta: (
			<Button variant="outline" asChild>
				<a href="#contact">Contact sales</a>
			</Button>
		),
	},
];

const FAQ = [
	{
		question: "Can I switch plans later?",
		answer:
			"Yes — upgrade or downgrade at any time from the workspace settings. We prorate the difference automatically and email a fresh receipt.",
	},
	{
		question: "Is there a free trial of Pro?",
		answer:
			"Every new workspace gets a 14-day Pro trial. No credit card required up front. If you don't upgrade, you drop to Starter automatically.",
	},
	{
		question: "How does billing work for teams?",
		answer:
			"Team plans bill per workspace, not per seat. Add as many engineers and agents as you need. Annual billing knocks 20% off the monthly rate.",
	},
	{
		question: "Do you offer discounts for open source?",
		answer:
			"Yes — registered open-source maintainers get Pro free. Email proof of your project (a public repo + active maintenance) and we'll flip it on.",
	},
	{
		question: "What happens to my data if I cancel?",
		answer:
			"Your registry data stays available for 30 days as read-only, then is permanently deleted. Export endpoints are exposed for the entire grace window.",
	},
];

const FOOTER_COLUMNS = [
	{
		title: "Product",
		links: [
			{ label: "Features", href: "/landing" },
			{ label: "Pricing", href: "/pricing" },
			{ label: "Docs", href: "/docs" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Careers", href: "#careers" },
			{ label: "Press", href: "#press" },
		],
	},
];

export default function PricingShowcasePage() {
	return (
		<div className="min-h-screen bg-background">
			<MarketingHeader
				logo={
					<a href="/landing" className="text-lg font-semibold text-foreground">
						Hex
					</a>
				}
				links={NAV_LINKS}
				actions={
					<>
						<Button variant="ghost" asChild>
							<a href="/sign-in">Sign in</a>
						</Button>
						<Button asChild>
							<a href="/sign-up">Get started</a>
						</Button>
					</>
				}
			/>

			<MarketingHero
				eyebrow={<Badge>Pricing</Badge>}
				title="Pricing that scales with you"
				description="Start free, upgrade when you grow. Every plan includes the full component catalog and MCP server."
			/>

			<MarketingPricing tiers={TIERS} />

			<MarketingFaq
				eyebrow="FAQ"
				title="Common questions"
				description="The short version. For anything else, the contact form is one click away."
				items={FAQ}
				defaultValue="item-1"
			/>

			<MarketingCta
				variant="panel"
				title="Still deciding?"
				description="Start a Pro trial in under a minute. No credit card required."
				actions={
					<>
						<Button size="lg" variant="secondary" asChild>
							<a href="/sign-up">Start Pro trial</a>
						</Button>
						<Button size="lg" variant="ghost" className="text-secondary-foreground" asChild>
							<a href="#contact">Talk to sales</a>
						</Button>
					</>
				}
			/>

			<MarketingFooter
				brand={
					<div>
						<div className="text-lg font-semibold text-foreground">Hex</div>
						<p className="mt-3 max-w-xs text-sm text-muted-foreground">
							Spec-driven UI for AI agents and the humans who guide them.
						</p>
					</div>
				}
				columns={FOOTER_COLUMNS}
				copyright={<>© 2026 Hex Core. All rights reserved.</>}
			/>
		</div>
	);
}
