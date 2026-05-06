import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentPage } from "../../../../components/component-page";
import { getDemo } from "../../../../lib/demos";
import { listComponents } from "../../../../lib/registry";
import { getRegistryItem } from "../../../../lib/registry.server";

/**
 * Generate one static route per registry item.
 * Replaces N hand-written page.tsx files with a single template.
 */
export function generateStaticParams() {
	return listComponents().map((item) => ({ slug: item.name }));
}

/**
 * Per-page metadata derived from the registry.
 * @param params - Route params (async in Next.js 16)
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const item = await getRegistryItem(slug);
	if (!item) return { title: "Not found" };
	return {
		title: item.displayName,
		description: item.description,
		openGraph: {
			title: `${item.displayName} — Hex Core`,
			description: item.description,
			url: `/docs/components/${slug}`,
			type: "article",
		},
	};
}

/**
 * Dynamic component documentation page.
 * Reads the registry item and renders a full docs page via `ComponentPage`.
 */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const item = await getRegistryItem(slug);
	if (!item) notFound();

	return <ComponentPage item={item} Demo={getDemo(slug)} />;
}

export const dynamicParams = false;
