import Link from "next/link";
import { DocsFooter } from "../../components/docs-footer";
import {
	CATEGORY_LABELS,
	CATEGORY_ORDER,
	componentsByCategory,
	type RegistryIndexItem,
} from "../../lib/registry";

export const metadata = {
	title: "Components",
	description: "Browse every component in the Hex Core registry, grouped by category.",
};

interface CategoryGroup {
	key: string;
	title: string;
	items: RegistryIndexItem[];
}

function orderedGroups(): CategoryGroup[] {
	const groups = componentsByCategory();
	const ordered: CategoryGroup[] = [];
	for (const key of CATEGORY_ORDER) {
		const items = groups[key];
		if (!items) continue;
		ordered.push({ key, title: CATEGORY_LABELS[key] ?? key, items });
	}
	return ordered;
}

/**
 * Docs index — grid of every registry component grouped by category. Server
 * component; reads directly from the registry JSON.
 */
export default function DocsIndexPage() {
	const groups = orderedGroups();

	return (
		<main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
			<div className="mb-10">
				<h1 className="text-3xl font-bold tracking-tight">Components</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					Every component in the Hex Core registry, grouped by category. Click any card to
					see usage, props, and AI-ready metadata.
				</p>
			</div>

			<div className="space-y-12">
				{groups.map((g) => (
					<CategorySection key={g.key} title={g.title} items={g.items} />
				))}
			</div>

			<DocsFooter pathname="/docs" />
		</main>
	);
}

/** One category row on the /docs index — heading + card grid. */
function CategorySection({ title, items }: { title: string; items: RegistryIndexItem[] }) {
	return (
		<section>
			<h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{title}
			</h2>
			<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((item) => (
					<li key={item.name}>
						<Link
							href={`/docs/components/${item.name}`}
							className="group flex h-full flex-col gap-2 rounded-lg border bg-card p-4 transition-all duration-200 ease-out hover:border-foreground/40 hover:bg-accent"
						>
							<span className="text-sm font-semibold text-foreground">
								{item.displayName}
							</span>
							<span className="line-clamp-2 text-xs text-muted-foreground">
								{item.description}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
