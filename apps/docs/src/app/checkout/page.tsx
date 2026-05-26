import type { Metadata } from "next";
import {
	Button,
	CommerceCheckout,
	Input,
	Label,
	MarketingFooter,
	MarketingHeader,
} from "@hex-core/components";

export const metadata: Metadata = {
	title: { absolute: "Checkout — Hex Core" },
	description:
		"Live showcase of the commerce-checkout block composed into a checkout page via the checkout-page recipe.",
};

function Swatch({ from, to }: { from: string; to: string }) {
	return <div className={`size-full bg-gradient-to-br ${from} ${to}`} />;
}

const SUMMARY_ITEMS = [
	{ name: "Canvas Tote", price: "$48.00", quantity: 1, image: <Swatch from="from-amber-200" to="to-amber-400" /> },
	{ name: "Wool Beanie", price: "$56.00", quantity: 2, image: <Swatch from="from-slate-300" to="to-slate-500" /> },
];

export default function CheckoutShowcasePage() {
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
				]}
				actions={
					<Button variant="ghost" asChild>
						<a href="/store">Back to cart</a>
					</Button>
				}
			/>

			<CommerceCheckout
				title="Checkout"
				summary={
					<>
						<ul className="flex flex-col gap-3">
							{SUMMARY_ITEMS.map((item) => (
								<li key={item.name} className="flex gap-3">
									<div className="size-12 flex-none overflow-hidden rounded-md bg-muted">{item.image}</div>
									<div className="flex flex-1 flex-col">
										<span className="text-sm font-medium text-foreground">{item.name}</span>
										<span className="text-xs text-muted-foreground">Qty {item.quantity}</span>
									</div>
									<span className="text-sm font-medium text-foreground">{item.price}</span>
								</li>
							))}
						</ul>
						<div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>Subtotal</span>
								<span>$104.00</span>
							</div>
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>Shipping</span>
								<span>Free</span>
							</div>
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>Tax</span>
								<span>$8.58</span>
							</div>
							<div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
								<span>Total</span>
								<span>$112.58</span>
							</div>
						</div>
					</>
				}
			>
				<form className="flex flex-col gap-8">
					<fieldset className="flex flex-col gap-4">
						<legend className="text-base font-semibold text-foreground">Contact</legend>
						<div className="flex flex-col gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="you@example.com" />
						</div>
					</fieldset>

					<fieldset className="flex flex-col gap-4">
						<legend className="text-base font-semibold text-foreground">Shipping address</legend>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-2">
								<Label htmlFor="first">First name</Label>
								<Input id="first" placeholder="Ada" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="last">Last name</Label>
								<Input id="last" placeholder="Lovelace" />
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="address">Address</Label>
							<Input id="address" placeholder="140 New Montgomery St" />
						</div>
						<div className="grid gap-4 sm:grid-cols-3">
							<div className="flex flex-col gap-2 sm:col-span-2">
								<Label htmlFor="city">City</Label>
								<Input id="city" placeholder="San Francisco" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="zip">ZIP</Label>
								<Input id="zip" placeholder="94105" />
							</div>
						</div>
					</fieldset>

					<fieldset className="flex flex-col gap-4">
						<legend className="text-base font-semibold text-foreground">Payment</legend>
						<div className="flex flex-col gap-2">
							<Label htmlFor="card">Card number</Label>
							<Input id="card" inputMode="numeric" placeholder="4242 4242 4242 4242" />
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-2">
								<Label htmlFor="exp">Expiry</Label>
								<Input id="exp" placeholder="MM / YY" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="cvc">CVC</Label>
								<Input id="cvc" inputMode="numeric" placeholder="123" />
							</div>
						</div>
					</fieldset>

					<Button type="submit" size="lg" className="self-start">
						Pay $112.58
					</Button>
				</form>
			</CommerceCheckout>

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
