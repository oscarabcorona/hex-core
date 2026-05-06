import { DocSection } from "../../../components/doc-section";
import { DocsPage } from "../../../components/docs-page";

export const metadata = {
	title: "FAQ",
	description: "Common questions about Hex Core, MCP integration, and customization.",
};

interface FaqEntry {
	id: string;
	label: string;
	q: string;
	a: string;
}

const QUESTIONS: readonly FaqEntry[] = [
	{
		id: "why-not-npm",
		label: "Not an npm package",
		q: "Why isn't Hex Core a plain npm package?",
		a: "Because you shouldn't version-lock to a library's internals. You copy components into your project — full ownership, no dep upgrades, no runtime cost.",
	},
	{
		id: "tailwind-version",
		label: "Tailwind version",
		q: "Which Tailwind version is required?",
		a: "Tailwind CSS v4. The token system uses @theme and @custom-variant, both v4-only features.",
	},
	{
		id: "react-version",
		label: "React 18 support",
		q: "Does it work with React 18?",
		a: "Everything ships targeting React 19. Most components work on 18 (ref-as-prop is the main v19-only affordance), but no guarantee — we don't test against 18.",
	},
	{
		id: "license",
		label: "License",
		q: "License?",
		a: "MIT on the library source. Use it in personal or commercial projects, modify freely, no attribution required.",
	},
	{
		id: "ship-a-new-component",
		label: "Propose a component",
		q: "How do I propose a new component?",
		a: "Open a discussion on GitHub with the use case. If it's broadly applicable and distinct from what's already shipped, we'll add it to the registry and publish a schema.",
	},
	{
		id: "contrib",
		label: "Theme contributions",
		q: "Can I contribute theming presets?",
		a: "Yes. PR a CSS snippet with a full light + dark palette and we'll add it to the theming page as a drop-in recipe.",
	},
] as const;

/** Frequently asked questions. TOC uses short labels; body uses full questions. */
export default function FaqPage() {
	return (
		<DocsPage
			pathname="/docs/faq"
			title="FAQ"
			description="Short answers to the questions people ask most."
			sections={QUESTIONS.map((q) => ({ id: q.id, title: q.label }))}
			editPath="apps/docs/src/app/docs/faq/page.tsx"
		>
			{QUESTIONS.map((q) => (
				<DocSection key={q.id} id={q.id} title={q.q}>
					<p className="text-sm leading-6 text-muted-foreground">{q.a}</p>
				</DocSection>
			))}
		</DocsPage>
	);
}
