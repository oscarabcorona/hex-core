import type { Metadata } from "next";
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	Input,
	Label,
	MarketingContact,
	MarketingContent,
	MarketingFooter,
	MarketingHeader,
	MarketingHero,
	MarketingStats,
	MarketingTeam,
} from "@hex-core/components";

export const metadata: Metadata = {
	title: { absolute: "About — Hex Core" },
	description:
		"Live showcase of the marketing section blocks composed into an About page via the about-page recipe.",
};

const NAV_LINKS = [
	{ label: "Product", href: "#product" },
	{ label: "Team", href: "#team" },
	{ label: "Docs", href: "/docs" },
];

const TEAM = [
	{
		name: "Ada Lovelace",
		role: "Founder & CEO",
		avatar: (
			<Avatar>
				<AvatarFallback>AL</AvatarFallback>
			</Avatar>
		),
		bio: "Spent a decade shipping design systems at scale before starting Hex.",
	},
	{
		name: "Alan Turing",
		role: "CTO",
		avatar: (
			<Avatar>
				<AvatarFallback>AT</AvatarFallback>
			</Avatar>
		),
		bio: "Builds the compiler and the MCP server. Lives in the type system.",
	},
	{
		name: "Grace Hopper",
		role: "Head of Design",
		avatar: (
			<Avatar>
				<AvatarFallback>GH</AvatarFallback>
			</Avatar>
		),
		bio: "Translates token systems into the components agents actually pick.",
	},
	{
		name: "Katherine Johnson",
		role: "Head of Research",
		avatar: (
			<Avatar>
				<AvatarFallback>KJ</AvatarFallback>
			</Avatar>
		),
		bio: "Maps the gaps between human and agent intent.",
	},
	{
		name: "Margaret Hamilton",
		role: "Principal Engineer",
		avatar: (
			<Avatar>
				<AvatarFallback>MH</AvatarFallback>
			</Avatar>
		),
		bio: "Keeps the registry honest and the CI green.",
	},
	{
		name: "Hedy Lamarr",
		role: "Head of Growth",
		avatar: (
			<Avatar>
				<AvatarFallback>HL</AvatarFallback>
			</Avatar>
		),
		bio: "Finds the teams Hex is already invisibly powering.",
	},
];

const STATS = [
	{ value: "43", label: "Section blocks", description: "Across marketing, app, commerce, and auth." },
	{ value: "8", label: "Page recipes", description: "Each composes into a real page in this docs site." },
	{ value: "9", label: "Packages", description: "From tokens to MCP server, all published to npm." },
];

const POSTS = [
	{
		title: "Spec-driven UI is the default for agents",
		excerpt: "Why every component in Hex ships a machine-readable schema and what that unlocks for autonomous tooling.",
		meta: "Engineering · May 2026 · 6 min",
		href: "/docs",
	},
	{
		title: "Tokens, not class names",
		excerpt: "How a single semantic-token swap restyles 43 section blocks without touching a single component file.",
		meta: "Design · Apr 2026 · 4 min",
		href: "/docs/theming",
	},
	{
		title: "Inside the MCP server",
		excerpt: "A tour of the four tools every Hex client gets for free, and how AI assistants discover them.",
		meta: "Engineering · Mar 2026 · 8 min",
		href: "/docs/mcp",
	},
];

const FOOTER_COLUMNS = [
	{
		title: "Product",
		links: [
			{ label: "Features", href: "#features" },
			{ label: "Docs", href: "/docs" },
			{ label: "Changelog", href: "/docs" },
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

export default function AboutShowcasePage() {
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
							<a href="/docs">Docs</a>
						</Button>
						<Button asChild>
							<a href="/sign-up">Get started</a>
						</Button>
					</>
				}
			/>

			<MarketingHero
				eyebrow={<Badge>About us</Badge>}
				title="A design system built for humans and agents"
				description="Hex was founded on a simple bet: that AI assistants will assemble more UI than people will. Everything we ship — components, tokens, blocks, recipes — is built for that future."
				actions={
					<>
						<Button size="lg" asChild>
							<a href="#team">Meet the team</a>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<a href="#contact">Get in touch</a>
						</Button>
					</>
				}
			/>

			<div id="team">
				<MarketingTeam
					eyebrow="Team"
					title="The people behind Hex"
					description="A small, opinionated team of engineers, designers, and researchers shipping the spec-driven layer."
					members={TEAM}
				/>
			</div>

			<MarketingStats
				eyebrow="By the numbers"
				title="What ships in the box"
				description="Every Hex install gets the full catalog, addressable by your agents via MCP."
				stats={STATS}
			/>

			<MarketingContent
				eyebrow="Writing"
				title="Recent posts"
				description="Notes from the team on tokens, agents, and the protocol gluing them together."
				posts={POSTS}
				columns="three"
			/>

			<div id="contact">
				<MarketingContact
					eyebrow="Contact"
					title="Talk to us"
					description="Hiring, partnerships, or just curious — drop us a line."
					details={
						<div className="flex flex-col gap-3">
							<div>
								<div className="text-xs font-medium uppercase tracking-wide text-foreground">Email</div>
								<a href="mailto:hi@hex.example" className="hover:text-foreground">
									hi@hex.example
								</a>
							</div>
							<div>
								<div className="text-xs font-medium uppercase tracking-wide text-foreground">Press</div>
								<a href="mailto:press@hex.example" className="hover:text-foreground">
									press@hex.example
								</a>
							</div>
							<div>
								<div className="text-xs font-medium uppercase tracking-wide text-foreground">Office</div>
								<p>140 New Montgomery St, San Francisco, CA</p>
							</div>
						</div>
					}
					form={
						<form className="flex flex-col gap-5">
							<div className="flex flex-col gap-2">
								<Label htmlFor="name">Name</Label>
								<Input id="name" placeholder="Ada Lovelace" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" placeholder="you@example.com" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="message">Message</Label>
								<textarea
									id="message"
									rows={5}
									className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									placeholder="Tell us what you're building…"
								/>
							</div>
							<Button type="submit" className="self-start">
								Send message
							</Button>
						</form>
					}
				/>
			</div>

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
