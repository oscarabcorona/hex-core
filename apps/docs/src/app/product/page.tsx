import type { Metadata } from "next";
import {
	Badge,
	Button,
	CommerceProductDetail,
	CommerceProductFeatures,
	CommerceReviews,
	Label,
	MarketingCta,
	MarketingFooter,
	MarketingHeader,
} from "@hex-core/components";

export const metadata: Metadata = {
	title: { absolute: "Product — Hex Core" },
	description:
		"Live showcase of the commerce-product-detail + features + reviews blocks composed into a product detail page via the product-page recipe.",
};

function Swatch({ from, to }: { from: string; to: string }) {
	return <div className={`size-full bg-gradient-to-br ${from} ${to}`} />;
}

const FEATURES = [
	{
		title: "Heavyweight 18oz canvas",
		description:
			"Sourced from a mill in North Carolina, this canvas softens with wear but holds its shape for years. Pre-washed so it won't shrink.",
		media: (
			<div className="aspect-[4/3]">
				<Swatch from="from-amber-100" to="to-amber-300" />
			</div>
		),
	},
	{
		title: "Reinforced bridle leather handles",
		description:
			"Riveted at four points, hand-stitched at the edges. Built to carry a laptop, a 6-pack, or a stack of books without complaint.",
		media: (
			<div className="aspect-[4/3]">
				<Swatch from="from-orange-200" to="to-amber-500" />
			</div>
		),
	},
	{
		title: "Made in small batches",
		description:
			"Sewn in our Oakland workshop, twenty totes at a time. If something's off, the maker's initials are inside — they'll fix it.",
		media: (
			<div className="aspect-[4/3]">
				<Swatch from="from-amber-200" to="to-orange-300" />
			</div>
		),
	},
];

const REVIEWS = [
	{
		author: "Jordan L.",
		rating: 5,
		title: "Perfect everyday tote",
		body: "Roomy, sturdy, and looks great. I've been carrying it daily for two months and it's only gotten better.",
		date: "Mar 2026",
	},
	{
		author: "Sam P.",
		rating: 4,
		body: "Great quality canvas — runs a touch larger than expected, which I actually like.",
		date: "Feb 2026",
	},
	{
		author: "Riley C.",
		rating: 5,
		title: "Replaces three bags",
		body: "Used to switch between a gym bag, a laptop bag, and a grocery tote. Now I just take this one.",
		date: "Jan 2026",
	},
];

export default function ProductShowcasePage() {
	return (
		<div className="min-h-screen bg-background">
			<MarketingHeader
				logo={
					<a href="/store" className="text-lg font-semibold text-foreground">
						Hex Goods
					</a>
				}
				links={[
					{ label: "New", href: "/store#new" },
					{ label: "Bags", href: "/store#bags" },
					{ label: "Accessories", href: "/store#accessories" },
				]}
				actions={
					<Button asChild>
						<a href="#cart">Cart (0)</a>
					</Button>
				}
			/>

			<CommerceProductDetail
				eyebrow="Bags"
				name="Canvas Tote"
				price="$48"
				description="A roomy everyday tote in heavyweight natural canvas with reinforced leather handles. Holds a laptop, a notebook, and lunch — at the same time."
				media={
					<div className="aspect-square">
						<Swatch from="from-amber-200" to="to-amber-400" />
					</div>
				}
				options={
					<div className="flex flex-col gap-5">
						<div className="flex flex-col gap-2">
							<Label>Color</Label>
							<div className="flex gap-2">
								<Button variant="default" size="sm">
									Natural
								</Button>
								<Button variant="outline" size="sm">
									Black
								</Button>
								<Button variant="outline" size="sm">
									Olive
								</Button>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Label>Size</Label>
							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									Small
								</Button>
								<Button variant="default" size="sm">
									Standard
								</Button>
								<Button variant="outline" size="sm">
									Tall
								</Button>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="secondary">In stock</Badge>
							<span className="text-sm text-muted-foreground">Ships in 1–2 business days</span>
						</div>
					</div>
				}
				actions={
					<>
						<Button size="lg">Add to cart</Button>
						<Button size="lg" variant="outline">
							Save for later
						</Button>
					</>
				}
			/>

			<CommerceProductFeatures
				eyebrow="Built to last"
				title="Why this bag holds up"
				description="Three details that explain why the Canvas Tote is the last everyday bag you'll buy this decade."
				features={FEATURES}
			/>

			<CommerceReviews
				averageRating={4.7}
				totalCount={284}
				reviews={REVIEWS}
			/>

			<MarketingCta
				variant="panel"
				title="Free shipping over $50"
				description="Plus easy 30-day returns on everything in the shop."
				actions={
					<Button size="lg" variant="secondary" asChild>
						<a href="/store">Shop more</a>
					</Button>
				}
			/>

			<MarketingFooter
				brand={<div className="text-lg font-semibold text-foreground">Hex Goods</div>}
				columns={[
					{ title: "Shop", links: [{ label: "New", href: "/store#new" }, { label: "Bags", href: "/store#bags" }] },
					{ title: "Help", links: [{ label: "Shipping", href: "#shipping" }, { label: "Returns", href: "#returns" }] },
				]}
				copyright={<>© 2026 Hex Goods.</>}
			/>
		</div>
	);
}
