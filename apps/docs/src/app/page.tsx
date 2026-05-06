import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../components/brand-mark";
import { GithubLink } from "../components/github-link";
import { ThemeToggle } from "../components/theme-toggle";
import { GITHUB_URL } from "../lib/links";
import { installCommand, listComponents } from "../lib/registry";

interface Feature {
	title: string;
	body: string;
}

const FEATURES: readonly Feature[] = [
	{
		title: "Polished components",
		body: "Radix UI primitives, CVA variants, canonical transitions. Every component is senior-designer reviewed and ships with live demos.",
	},
	{
		title: "AI-native schemas",
		body: "Each component exports a .schema.ts with props, variants, whenToUse/whenNotToUse hints, common mistakes, accessibility notes, and a token budget.",
	},
	{
		title: "MCP-first distribution",
		body: "Discover and install components through the Hex Core MCP server. Claude Code reads the registry and picks the right primitive for your task.",
	},
	{
		title: "Dark mode by default",
		body: "HSL design tokens flip cleanly via next-themes. WCAG-safe contrast pairs out of the box.",
	},
] as const;

const SAMPLE_COMPONENT_SLUG = "button";

export const metadata: Metadata = {
	title: { absolute: "Hex Core — AI-Native Component Library" },
};

/** Marketing landing page for the docs site. Server-rendered. */
export default function Home() {
	const componentCount = listComponents().length;

	return (
		<div className="min-h-screen">
			<LandingHeader />
			<main className="mx-auto max-w-5xl px-6 py-20 sm:py-28 lg:px-8">
				<Hero componentCount={componentCount} />
				<Features />
				<InstallCta />
			</main>
			<LandingFooter />
		</div>
	);
}

/** Sticky marketing header. */
function LandingHeader() {
	return (
		<header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
			<BrandMark size="sm" />
			<nav aria-label="Primary" className="flex items-center gap-2">
				<Link
					href="/docs/getting-started"
					className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 ease-out hover:bg-accent hover:text-foreground"
				>
					Docs
				</Link>
				<Link
					href="/docs"
					className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-all duration-200 ease-out hover:bg-accent hover:text-foreground"
				>
					Components
				</Link>
				<ThemeToggle />
				<GithubLink />
			</nav>
		</header>
	);
}

/** Hero block with headline, subhead, and two CTAs. */
function Hero({ componentCount }: { componentCount: number }) {
	return (
		<section aria-labelledby="hero-title" className="text-center">
			<span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
				<span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
				{componentCount} components shipped
			</span>
			<h1
				id="hero-title"
				className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
			>
				The component layer for spec-driven UI.
			</h1>
			<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
				Hex Core ships production-grade Radix + Tailwind components with machine-readable
				schemas and recipes. Hand your agent a brief — Hex Core resolves it to a ranked
				component checklist over MCP, no runtime service required.
			</p>
			<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
				<Link
					href="/docs/getting-started"
					className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-all duration-200 ease-out hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
				>
					Get started
				</Link>
				<Link
					href="/docs"
					className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-5 text-sm font-medium text-foreground transition-all duration-200 ease-out hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
				>
					Browse components
				</Link>
			</div>
		</section>
	);
}

/** Four-tile feature grid. */
function Features() {
	return (
		<section aria-labelledby="features-title" className="mt-24">
			<h2 id="features-title" className="sr-only">
				Features
			</h2>
			<ul className="grid gap-3 sm:grid-cols-2">
				{FEATURES.map((f) => (
					<li
						key={f.title}
						className="rounded-lg border bg-card p-5 transition-all duration-200 ease-out hover:border-foreground/40"
					>
						<div className="text-sm font-semibold text-foreground">{f.title}</div>
						<p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
					</li>
				))}
			</ul>
		</section>
	);
}

/** Install command CTA (reuses registry.installCommand). */
function InstallCta() {
	return (
		<section aria-labelledby="install-title" className="mt-24 text-center">
			<h2 id="install-title" className="text-2xl font-semibold">
				Install in one command
			</h2>
			<p className="mt-2 text-sm text-muted-foreground">
				Copy any component into your project. No npm dependency.
			</p>
			<pre className="mx-auto mt-6 inline-block rounded-lg border bg-card px-4 py-3 text-left font-mono text-sm">
				<code>{installCommand(SAMPLE_COMPONENT_SLUG)}</code>
			</pre>
		</section>
	);
}

/** Page footer — copyright + small nav. */
function LandingFooter() {
	return (
		<footer className="border-t">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-muted-foreground lg:px-8">
				<span>© {new Date().getFullYear()} Hex Core</span>
				<nav aria-label="Footer" className="flex gap-4">
					<Link href="/docs" className="transition-all duration-200 ease-out hover:text-foreground">
						Docs
					</Link>
					<a
						href={GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="transition-all duration-200 ease-out hover:text-foreground"
					>
						GitHub
					</a>
				</nav>
			</div>
		</footer>
	);
}
