import type { Metadata } from "next";
import {
	Badge,
	Button,
	CommerceCart,
	CommerceCheckout,
	CommerceProductDetail,
	CommerceProductGrid,
	CommerceReviews,
	Input,
	Label,
	MarketingCta,
	MarketingFooter,
	MarketingHeader,
} from "@hex-core/components";

export const metadata: Metadata = {
	title: { absolute: "Store — Hex Core" },
	description: "Live showcase of the ecommerce section blocks (storefront-page recipe + the commerce blocks).",
};

/** A placeholder product image so the grid reads without bundled assets. */
function Swatch({ from, to }: { from: string; to: string }) {
	return <div className={`size-full bg-gradient-to-br ${from} ${to}`} />;
}

const PRODUCTS = [
	{ name: "Canvas Tote", price: "$48", href: "#tote", meta: "Natural", image: <Swatch from="from-amber-200" to="to-amber-400" /> },
	{ name: "Wool Beanie", price: "$28", href: "#beanie", meta: "Charcoal", image: <Swatch from="from-slate-300" to="to-slate-500" /> },
	{ name: "Leather Wallet", price: "$64", href: "#wallet", meta: "Tan", image: <Swatch from="from-orange-200" to="to-orange-400" /> },
	{ name: "Linen Scarf", price: "$36", href: "#scarf", meta: "Sage", image: <Swatch from="from-emerald-200" to="to-emerald-400" /> },
];

const REVIEWS = [
	{ author: "Jordan L.", rating: 5, title: "Perfect everyday tote", body: "Roomy, sturdy, and looks great. Exactly as described.", date: "Mar 2026" },
	{ author: "Sam P.", rating: 4, body: "Great quality canvas — runs a touch larger than expected.", date: "Feb 2026" },
];

const CART_ITEMS = [
	{ name: "Canvas Tote", price: "$48", quantity: 1, meta: "Natural", image: <Swatch from="from-amber-200" to="to-amber-400" /> },
	{ name: "Wool Beanie", price: "$56", quantity: 2, meta: "Charcoal", image: <Swatch from="from-slate-300" to="to-slate-500" /> },
];

/** Section label between the standalone block previews. */
function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
		</div>
	);
}

/**
 * Full-bleed showcase of the ecommerce section blocks: the storefront-page
 * recipe (header → product grid → promo → footer) plus standalone previews of
 * product detail, reviews, cart, and checkout. Sample content only.
 */
export default function StoreShowcasePage() {
	return (
		<div className="min-h-screen bg-background">
			<MarketingHeader
				logo={<a href="#top" className="text-lg font-semibold text-foreground">Hex Goods</a>}
				links={[
					{ label: "New", href: "#new" },
					{ label: "Bags", href: "#bags" },
					{ label: "Accessories", href: "#accessories" },
				]}
				actions={<Button asChild><a href="#cart">Cart (2)</a></Button>}
			/>

			<CommerceProductGrid title="New arrivals" products={PRODUCTS} />

			<MarketingCta
				variant="panel"
				title="Free shipping over $50"
				description="Plus easy 30-day returns on everything."
				actions={<Button size="lg" variant="secondary" asChild><a href="#new">Shop new</a></Button>}
			/>

			<SectionLabel>Block preview · product detail</SectionLabel>
			<CommerceProductDetail
				name="Canvas Tote"
				price="$48"
				eyebrow="Bags"
				description="A roomy everyday tote in heavyweight natural canvas with reinforced handles."
				media={<div className="aspect-square"><Swatch from="from-amber-200" to="to-amber-400" /></div>}
				options={
					<div className="flex flex-col gap-2">
						<Label>Color</Label>
						<div className="flex gap-2">
							<Button variant="outline" size="sm">Natural</Button>
							<Button variant="outline" size="sm">Black</Button>
						</div>
					</div>
				}
				actions={<Button size="lg">Add to cart</Button>}
			/>

			<SectionLabel>Block preview · reviews</SectionLabel>
			<CommerceReviews averageRating={4.5} totalCount={128} reviews={REVIEWS} />

			<SectionLabel>Block preview · cart</SectionLabel>
			<CommerceCart
				items={CART_ITEMS}
				summary={
					<>
						<div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>$104</span></div>
						<div className="flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span>Free</span></div>
						<div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground"><span>Total</span><span>$104</span></div>
					</>
				}
				actions={<Button size="lg">Checkout</Button>}
			/>

			<SectionLabel>Block preview · checkout</SectionLabel>
			<CommerceCheckout
				title="Checkout"
				summary={
					<>
						<div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>$104</span></div>
						<div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground"><span>Total</span><span>$104</span></div>
					</>
				}
			>
				<form className="flex flex-col gap-6">
					<fieldset className="flex flex-col gap-4">
						<legend className="text-base font-semibold text-foreground">Contact</legend>
						<div className="flex flex-col gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="you@example.com" />
						</div>
					</fieldset>
					<fieldset className="flex flex-col gap-4">
						<legend className="text-base font-semibold text-foreground">Shipping</legend>
						<div className="flex flex-col gap-2">
							<Label htmlFor="address">Address</Label>
							<Input id="address" placeholder="123 Main St" />
						</div>
					</fieldset>
					<Button type="submit" size="lg" className="self-start">Pay now</Button>
				</form>
			</CommerceCheckout>

			<MarketingFooter
				brand={<div className="text-lg font-semibold text-foreground">Hex Goods</div>}
				columns={[
					{ title: "Shop", links: [{ label: "New", href: "#new" }, { label: "Bags", href: "#bags" }] },
					{ title: "Help", links: [{ label: "Shipping", href: "#shipping" }, { label: "Returns", href: "#returns" }] },
				]}
				copyright={<>© 2026 Hex Goods.</>}
			/>
		</div>
	);
}
