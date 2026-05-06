/**
 * `hex theme list` — print every theme shipped by `@hex-core/*`.
 *
 * Combines the OSS catalog (`default` / `midnight` / `ember` from
 * `@hex-core/tokens`) with the brand-derived voltagent presets from
 * `@hex-core/themes`. Results are grouped by `category`; first-party
 * themes (no category) come first in an "uncategorized" group.
 *
 * Used by humans pre-`hex theme init` and by AI agents that want to
 * surface a brand picker without round-tripping the MCP server.
 */
import pico from "picocolors";

interface ListOptions {
	category?: string;
	tag?: string;
	json?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
	ai: "AI / LLM",
	"dev-tools": "Developer tools",
	backend: "Backend / Database",
	productivity: "Productivity",
	design: "Design",
	fintech: "Fintech",
	ecommerce: "E-commerce",
	media: "Media",
	automotive: "Automotive",
};

/**
 * Print the theme catalog in human-friendly grouped form, or as
 * JSON when `--json` is passed (useful for piping into a fuzzy-find
 * picker like `fzf`).
 *
 * @param options - Filter + format flags
 */
export async function themeList(options: ListOptions = {}): Promise<void> {
	const tokens = await import("@hex-core/tokens");
	const themesPkg = await import("@hex-core/themes");

	const ossList = tokens.listThemes();
	const premiumList = themesPkg.listPremiumThemes();

	const seen = new Set<string>();
	const all: Array<{
		name: string;
		displayName: string;
		description: string;
		category?: string;
		tags?: string[];
		brand?: string;
	}> = [];
	for (const t of [...ossList, ...premiumList]) {
		if (seen.has(t.name)) continue;
		seen.add(t.name);
		all.push(t);
	}

	const filtered = all.filter((t) => {
		if (options.category && t.category !== options.category) return false;
		if (options.tag) {
			const tags = (t.tags ?? []).map((x) => x.toLowerCase());
			if (!tags.includes(options.tag.toLowerCase())) return false;
		}
		return true;
	});

	if (options.json) {
		process.stdout.write(JSON.stringify(filtered, null, 2) + "\n");
		return;
	}

	if (filtered.length === 0) {
		console.log("No themes match the requested filters.");
		return;
	}

	const groups = new Map<string, typeof filtered>();
	for (const t of filtered) {
		const key = t.category ?? "uncategorized";
		const list = groups.get(key) ?? [];
		list.push(t);
		groups.set(key, list);
	}

	const orderedKeys = [
		"uncategorized",
		"ai",
		"dev-tools",
		"backend",
		"productivity",
		"design",
		"fintech",
		"ecommerce",
		"media",
		"automotive",
	];

	console.log(
		pico.bold(`Hex Core theme catalog — ${filtered.length} preset${filtered.length === 1 ? "" : "s"}`),
	);
	console.log("");

	for (const key of orderedKeys) {
		const list = groups.get(key);
		if (!list || list.length === 0) continue;
		const label = key === "uncategorized" ? "First-party" : (CATEGORY_LABELS[key] ?? key);
		console.log(pico.cyan(`${label} (${list.length})`));
		const sortedList = [...list].sort((a, b) => a.name.localeCompare(b.name));
		for (const t of sortedList) {
			const slug = pico.bold(t.name.padEnd(20));
			const tags = t.tags && t.tags.length > 0 ? pico.dim(`[${t.tags.join(", ")}]`) : "";
			console.log(`  ${slug} ${pico.dim(t.description)} ${tags}`);
		}
		console.log("");
	}

	console.log(pico.dim("Use `hex theme init --name <slug>` to scaffold."));
}
