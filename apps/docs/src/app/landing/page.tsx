import type { Metadata } from "next";
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	MarketingCta,
	MarketingFeatureGrid,
	MarketingFooter,
	MarketingHeader,
	MarketingHero,
	MarketingLogoCloud,
	MarketingPricing,
	MarketingTestimonial,
} from "@hex-core/components";

export const metadata: Metadata = {
	title: { absolute: "Landing — Hex Core" },
	description:
		"Live showcase of the marketing section blocks composed into a full landing page via the landing-page recipe.",
};

const NAV_LINKS = [
	{ label: "Features", href: "#features" },
	{ label: "Pricing", href: "#pricing" },
	{ label: "Docs", href: "/docs" },
];

const WORDMARKS = ["Northwind", "Globex", "Initech", "Umbra", "Vertex"];

const FEATURES = [
	{ title: "Spec-driven", description: "Every component ships a machine-readable schema your agents read." },
	{ title: "Theme-native", description: "Swap design tokens, not class names — the whole page restyles." },
	{ title: "MCP-first", description: "Discover, install, and compose from any AI client over MCP." },
	{ title: "Composable blocks", description: "Page sections snap together into landing, app, and store pages." },
	{ title: "Accessible", description: "Semantic structure and focus states baked into every block." },
	{ title: "Typed end to end", description: "Strict TypeScript from registry to runtime — no any." },
];

const TIERS = [
	{
		name: "Starter",
		price: "$0",
		period: "/mo",
		description: "For side projects.",
		features: ["1 project", "Community support", "Core components"],
		cta: (
			<Button variant="outline" asChild>
				<a href="#starter">Start free</a>
			</Button>
		),
	},
	{
		name: "Pro",
		price: "$29",
		period: "/mo",
		description: "For growing teams.",
		highlighted: true,
		badge: <Badge>Most popular</Badge>,
		features: ["Unlimited projects", "Priority support", "All blocks", "Analytics"],
		cta: (
			<Button asChild>
				<a href="#pro">Choose Pro</a>
			</Button>
		),
	},
	{
		name: "Team",
		price: "$99",
		period: "/mo",
		description: "For organizations.",
		features: ["Everything in Pro", "SSO", "Audit log", "Dedicated support"],
		cta: (
			<Button variant="outline" asChild>
				<a href="#team">Contact sales</a>
			</Button>
		),
	},
];

const TESTIMONIALS = [
	{
		quote: "Hex cut our design-to-ship time in half. Our agents assemble pages now.",
		authorName: "Jordan Lee",
		authorTitle: "Head of Design, Acme",
		avatar: (
			<Avatar>
				<AvatarFallback>JL</AvatarFallback>
			</Avatar>
		),
	},
	{
		quote: "The MCP server means our AI tools install components without us copy-pasting.",
		authorName: "Sam Patel",
		authorTitle: "CTO, Globex",
		avatar: (
			<Avatar>
				<AvatarFallback>SP</AvatarFallback>
			</Avatar>
		),
	},
	{
		quote: "Theme tokens are the unlock — one swap and the entire site rebrands.",
		authorName: "Riley Chen",
		authorTitle: "Founder, Vertex",
		avatar: (
			<Avatar>
				<AvatarFallback>RC</AvatarFallback>
			</Avatar>
		),
	},
];

const FOOTER_COLUMNS = [
	{
		title: "Product",
		links: [
			{ label: "Features", href: "#features" },
			{ label: "Pricing", href: "#pricing" },
			{ label: "Changelog", href: "/docs" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "#about" },
			{ label: "Careers", href: "#careers" },
			{ label: "Contact", href: "#contact" },
		],
	},
];

/**
 * Full-bleed showcase of the marketing section blocks composed into a landing
 * page in the order the `landing-page` recipe declares. Sample content only —
 * mirrors what an agent assembles when it installs the recipe.
 */
export default function LandingShowcasePage() {
	return (
		<div className="min-h-screen bg-background">
			<MarketingHeader
				logo={
					<a href="#top" className="text-lg font-semibold text-foreground">
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
				eyebrow={<Badge>v2 is here</Badge>}
				title="Ship spec-driven UI in minutes"
				description="AI-native components, tokens, and blocks your agents can discover and assemble end to end — over MCP."
				actions={
					<>
						<Button size="lg" asChild>
							<a href="#features">Get started</a>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<a href="/docs">Read the docs</a>
						</Button>
					</>
				}
			/>

			<MarketingLogoCloud
				title="Trusted by teams everywhere"
				logos={WORDMARKS.map((name) => (
					<span key={name} className="text-lg font-semibold tracking-tight">
						{name}
					</span>
				))}
			/>

			<div id="features">
				<MarketingFeatureGrid
					eyebrow="Why Hex"
					title="Everything your agents need"
					description="One source of truth for components, tokens, and blocks — readable by humans and LLMs alike."
					features={FEATURES}
				/>
			</div>

			<div id="pricing">
				<MarketingPricing
					eyebrow="Pricing"
					title="Pricing that scales with you"
					description="Start free, upgrade when you grow. Every plan includes the full component catalog."
					tiers={TIERS}
				/>
			</div>

			<MarketingTestimonial layout="grid" eyebrow="Testimonials" title="Loved by builders" testimonials={TESTIMONIALS} />

			<MarketingCta
				variant="panel"
				title="Start building today"
				description="Install the MCP server and scaffold your first page in a single prompt."
				actions={
					<Button size="lg" variant="secondary" asChild>
						<a href="/sign-up">Get started free</a>
					</Button>
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
