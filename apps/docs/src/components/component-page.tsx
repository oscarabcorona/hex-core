import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { codeToHtml } from "shiki";
import type { RegistryItem } from "@hex-core/registry";
import { INSTALL_COMMAND_LABEL, installCommand, slugify, usageFallback } from "../lib/registry";
import { DOCS_CONTENT_WRAPPER, SHIKI_THEMES } from "../lib/ui-tokens";
import { CodeBlock } from "./code-block";
import { ComponentPreview } from "./component-preview";
import { DocsBreadcrumb } from "./docs-breadcrumb";
import { DocsFooter } from "./docs-footer";
import { OnThisPage, type TocSection } from "./on-this-page";
import { OnThisPageCompact } from "./on-this-page-compact";
import { PropsTable } from "./props-table";

async function highlight(code: string, lang: "tsx" | "ts" | "bash" = "tsx"): Promise<string> {
	return codeToHtml(code, {
		lang,
		themes: SHIKI_THEMES,
		defaultColor: false,
	});
}

/**
 * Render a full component documentation page from a registry item.
 * Consumes the .schema.ts / registry JSON as the single source of truth —
 * no hand-written prop tables, install commands, or usage examples here.
 * @param item - The full registry item for the component
 * @param Demo - The demo component to render in the live preview
 */
export async function ComponentPage({
	item,
	Demo,
}: {
	item: RegistryItem;
	Demo: ComponentType | undefined;
}) {
	// P5: narrow on the example's existence + non-empty code, not on
	// boolean-coerced previewCode alone (guards against zero-length code strings).
	const firstExample = item.examples[0];
	const previewCode = firstExample?.code ?? "";
	const hasInlinePreview = Boolean(Demo && firstExample && previewCode.length > 0);
	const previewHtml = hasInlinePreview ? await highlight(previewCode) : "";
	const extraExamples = hasInlinePreview ? item.examples.slice(1) : item.examples;

	const sections: TocSection[] = [
		{ id: "installation", title: "Installation" },
		// "Usage" section only shows up when we need the fallback import stub —
		// otherwise the ComponentPreview's Code tab is the canonical usage view.
		...(hasInlinePreview ? [] : [{ id: "usage", title: "Usage" }]),
		...extraExamples.map((e) => ({
			id: slugify(e.title),
			title: e.title,
		})),
		{ id: "api-reference", title: "API Reference" },
		{ id: "ai-guidance", title: "AI Guidance" },
	];

	return (
		<div className="flex">
			<main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
				<div className={DOCS_CONTENT_WRAPPER}>
					<DocsBreadcrumb
						trail={[
							{ label: "Docs", href: "/docs" },
							{ label: "Components", href: "/docs" },
							{ label: item.displayName },
						]}
					/>
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight">{item.displayName}</h1>
						<p className="mt-2 text-lg text-muted-foreground">{item.description}</p>
					</div>

					<OnThisPageCompact sections={sections} className="mb-6" />

					{hasInlinePreview && Demo ? (
						<ComponentPreview code={previewCode} codeHtml={previewHtml}>
							<Demo />
						</ComponentPreview>
					) : Demo ? (
						<figure className="overflow-hidden rounded-lg border">
							<figcaption className="border-b bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
								Live example
							</figcaption>
							<div className="flex min-h-[200px] items-center justify-center p-8">
								<Demo />
							</div>
						</figure>
					) : null}

					<Section id="installation" title="Installation">
						<CodeBlock label={INSTALL_COMMAND_LABEL} code={installCommand(item.name)} />
					</Section>

					{hasInlinePreview ? null : (
						<Section id="usage" title="Usage">
							<CodeBlock code={usageFallback(item)} />
						</Section>
					)}

					{extraExamples.map((example) => (
						<Section key={example.title} id={slugify(example.title)} title={example.title}>
							<p className="mb-4 text-sm text-muted-foreground">{example.description}</p>
							<CodeBlock code={example.code} />
						</Section>
					))}

					<Section id="api-reference" title="API Reference">
						<PropsTable props={item.props} />
					</Section>

					<Section id="ai-guidance" title="AI Guidance">
						<AIGuidance ai={item.ai} />
					</Section>

					<DocsFooter
						pathname={`/docs/components/${item.name}`}
						editPath={`registry/items/${item.name}.json`}
					/>
				</div>
			</main>
			<OnThisPage sections={sections} />
		</div>
	);
}

/** A scroll-targeted section heading + content wrapper. */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
	return (
		<section id={id} className="mt-10 scroll-mt-16">
			<h2 className="mb-4 text-xl font-semibold">{title}</h2>
			{children}
		</section>
	);
}

/** Renders the `ai` hint block from a registry item. */
function AIGuidance({ ai }: { ai: RegistryItem["ai"] }) {
	return (
		<div className="space-y-4 text-sm">
			<div>
				<h3 className="mb-1 font-semibold">When to use</h3>
				<p className="text-muted-foreground">{ai.whenToUse}</p>
			</div>
			<div>
				<h3 className="mb-1 font-semibold">When not to use</h3>
				<p className="text-muted-foreground">{ai.whenNotToUse}</p>
			</div>
			{ai.commonMistakes.length > 0 && (
				<div>
					<h3 className="mb-1 font-semibold">Common mistakes</h3>
					<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
						{ai.commonMistakes.map((m) => (
							<li key={m}>{m}</li>
						))}
					</ul>
				</div>
			)}
			<div>
				<h3 className="mb-1 font-semibold">Accessibility</h3>
				<p className="text-muted-foreground">{ai.accessibilityNotes}</p>
			</div>
			{ai.relatedComponents.length > 0 && (
				<div>
					<h3 className="mb-1 font-semibold">Related components</h3>
					<ul className="flex flex-wrap gap-2">
						{ai.relatedComponents.map((name) => (
							<li key={name}>
								<Link
									href={`/docs/components/${name}`}
									className="rounded-md border px-2 py-1 text-xs text-foreground transition-all duration-200 ease-out hover:bg-accent"
								>
									{name}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
			<p className="text-xs text-muted-foreground">
				Token budget: <code className="rounded bg-muted px-1 py-0.5">{ai.tokenBudget}</code>
			</p>
		</div>
	);
}
