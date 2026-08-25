import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@hex-core/components";

/**
 * Accordion patterns: single-mode FAQ (one open at a time, collapsible)
 * and multi-mode (any subset open, default to first two expanded).
 */
export function AccordionDemo() {
	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Single-mode FAQ (one open at a time)
				</p>
				<Accordion type="single" collapsible>
					<AccordionItem value="item-1">
						<AccordionTrigger>Is it accessible?</AccordionTrigger>
						<AccordionContent>
							Yes. It adheres to the WAI-ARIA design pattern for accordions, with full
							keyboard navigation (arrow keys, Home, End) managed by Radix UI.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2">
						<AccordionTrigger>Is it styled?</AccordionTrigger>
						<AccordionContent>
							Yes. It comes with Hex Core&apos;s refined modern styling. Override any part via
							the <code className="rounded bg-muted px-1 py-0.5 text-xs">className</code>{" "}
							prop.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3">
						<AccordionTrigger>Is it animated?</AccordionTrigger>
						<AccordionContent>
							<p>Yes. Content expands and collapses with smooth CSS transitions:</p>
							<ul className="ml-4 mt-2 list-disc space-y-1">
								<li>
									<code className="rounded bg-muted px-1 py-0.5 text-xs">
										data-[state=open]:animate-accordion-down
									</code>
								</li>
								<li>
									<code className="rounded bg-muted px-1 py-0.5 text-xs">
										data-[state=closed]:animate-accordion-up
									</code>
								</li>
							</ul>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Multi-mode (any subset open)
				</p>
				<Accordion type="multiple" defaultValue={["shipping", "returns"]}>
					<AccordionItem value="shipping">
						<AccordionTrigger>Shipping</AccordionTrigger>
						<AccordionContent>
							Orders ship within 2 business days. Free delivery on orders over $50.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="returns">
						<AccordionTrigger>Returns</AccordionTrigger>
						<AccordionContent>
							30-day no-questions-asked returns. We cover the return shipping.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="warranty">
						<AccordionTrigger>Warranty</AccordionTrigger>
						<AccordionContent>
							One-year limited warranty covering manufacturing defects.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}
