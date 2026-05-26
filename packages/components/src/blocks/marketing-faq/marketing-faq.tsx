"use client";

import * as React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../../components/accordion/accordion.js";
import { cn } from "../../lib/utils.js";

/** One Q/A pair in {@link MarketingFaq}. */
export interface MarketingFaqItem {
	/** The question. */
	question: React.ReactNode;
	/** The answer. */
	answer: React.ReactNode;
}

/** Props for {@link MarketingFaq}. */
export interface MarketingFaqProps {
	/** Q/A pairs. */
	items: ReadonlyArray<MarketingFaqItem>;
	/** Section eyebrow above the title. */
	eyebrow?: React.ReactNode;
	/** Section heading. */
	title?: React.ReactNode;
	/** Section subcopy below the heading. */
	description?: React.ReactNode;
	/** Allow multiple items open at once. Defaults to `single`. */
	type?: "single" | "multiple";
	/** Slug of the item to start open (single type), or array of slugs (multiple). */
	defaultValue?: string | string[];
	/** Additional classes applied to the root `<section>`. */
	className?: string;
}

/**
 * FAQ section composing the Accordion primitive. Optional heading block above
 * a stack of question/answer pairs. Item ids are derived from the question's
 * 1-based index so `defaultValue` is stable across re-renders. Client Component
 * (Accordion owns the open/close state).
 */
export function MarketingFaq({
	items,
	eyebrow,
	title,
	description,
	type = "single",
	defaultValue,
	className,
}: MarketingFaqProps) {
	const hasHeading = Boolean(eyebrow || title || description);
	return (
		<section className={cn("bg-background py-24 sm:py-32", className)}>
			<div className="mx-auto max-w-3xl px-6 lg:px-8">
				{hasHeading ? (
					<div className="flex flex-col items-center gap-4 text-center">
						{eyebrow ? (
							<p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
						) : null}
						{title ? (
							<h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
								{title}
							</h2>
						) : null}
						{description ? (
							<p className="text-pretty text-lg text-muted-foreground">{description}</p>
						) : null}
					</div>
				) : null}
				{type === "single" ? (
					<Accordion
						type="single"
						collapsible
						defaultValue={typeof defaultValue === "string" ? defaultValue : undefined}
						className={cn(hasHeading && "mt-12")}
					>
						{items.map((item, index) => {
							const value = `item-${index + 1}`;
							return (
								<AccordionItem key={value} value={value}>
									<AccordionTrigger>{item.question}</AccordionTrigger>
									<AccordionContent>{item.answer}</AccordionContent>
								</AccordionItem>
							);
						})}
					</Accordion>
				) : (
					<Accordion
						type="multiple"
						defaultValue={Array.isArray(defaultValue) ? defaultValue : undefined}
						className={cn(hasHeading && "mt-12")}
					>
						{items.map((item, index) => {
							const value = `item-${index + 1}`;
							return (
								<AccordionItem key={value} value={value}>
									<AccordionTrigger>{item.question}</AccordionTrigger>
									<AccordionContent>{item.answer}</AccordionContent>
								</AccordionItem>
							);
						})}
					</Accordion>
				)}
			</div>
		</section>
	);
}
