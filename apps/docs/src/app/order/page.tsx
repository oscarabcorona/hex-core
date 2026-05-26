import type { Metadata } from "next";
import {
	Badge,
	Button,
	CommerceOrderSummary,
	MarketingCta,
	MarketingFooter,
	MarketingHeader,
} from "@hex-core/components";

export const metadata: Metadata = {
	title: { absolute: "Order — Hex Core" },
	description:
		"Live showcase of the commerce-order-summary block composed into an order confirmation page via the order-page recipe.",
};

function Swatch({ from, to }: { from: string; to: string }) {
	return <div className={`size-full bg-gradient-to-br ${from} ${to}`} />;
}

const ITEMS = [
	{
		name: "Canvas Tote",
		price: "$48.00",
		quantity: 1,
		meta: "Natural / One size",
		image: <Swatch from="from-amber-200" to="to-amber-400" />,
	},
	{
		name: "Wool Beanie",
		price: "$56.00",
		quantity: 2,
		meta: "Charcoal",
		image: <Swatch from="from-slate-300" to="to-slate-500" />,
	},
	{
		name: "Leather Wallet",
		price: "$64.00",
		quantity: 1,
		meta: "Tan",
		image: <Swatch from="from-orange-200" to="to-orange-400" />,
	},
];

const TOTALS = [
	{ label: "Subtotal", value: "$168.00" },
	{ label: "Shipping", value: "Free" },
	{ label: "Tax", value: "$13.86" },
	{ label: "Total", value: "$181.86", emphasized: true },
];

export default function OrderShowcasePage() {
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
					{ label: "Account", href: "#account" },
				]}
				actions={
					<Button variant="outline" asChild>
						<a href="/store">Continue shopping</a>
					</Button>
				}
			/>

			<section className="mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-24">
				<div className="mb-10 flex flex-col gap-3">
					<p className="text-sm font-semibold uppercase tracking-wide text-primary">Thanks for your order</p>
					<h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
						We&apos;ve received it
					</h1>
					<p className="text-pretty text-base text-muted-foreground">
						A receipt is on its way to ada@example.com. You can track shipping status from your account.
					</p>
				</div>

				<CommerceOrderSummary
					orderId="#1042"
					items={ITEMS}
					totals={TOTALS}
					status={<Badge>Confirmed</Badge>}
					meta={
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-1">
								<div className="text-xs font-medium uppercase tracking-wide text-foreground">Placed</div>
								<div className="text-muted-foreground">May 23, 2026</div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="text-xs font-medium uppercase tracking-wide text-foreground">Shipping to</div>
								<div className="text-muted-foreground">
									Ada Lovelace
									<br />
									140 New Montgomery St
									<br />
									San Francisco, CA 94105
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="text-xs font-medium uppercase tracking-wide text-foreground">Payment</div>
								<div className="text-muted-foreground">Visa ending in 4242</div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="text-xs font-medium uppercase tracking-wide text-foreground">Method</div>
								<div className="text-muted-foreground">Standard · 3–5 business days</div>
							</div>
						</div>
					}
					actions={
						<>
							<Button variant="outline" asChild>
								<a href="#invoice">Download invoice</a>
							</Button>
							<Button variant="ghost" asChild>
								<a href="#support">Contact support</a>
							</Button>
						</>
					}
				/>
			</section>

			<MarketingCta
				variant="panel"
				title="Tell us what you think"
				description="Reviews from new owners help everyone pick the right bag."
				actions={
					<Button size="lg" variant="secondary" asChild>
						<a href="#review">Leave a review</a>
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
