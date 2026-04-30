/**
 * Import the voltagent/awesome-design-md (a.k.a. `getdesign`) brand
 * brief library into `@hex-core/themes` as 71 ready-to-use theme
 * presets. Reproducible: rerun `pnpm import:themes` to regenerate
 * every preset from the bundled markdown briefs at
 * `.cache/getdesign-templates/*.md`.
 *
 * Pipeline (per preset):
 *   1. Read `<brand>.md` and `manifest.json`
 *   2. Extract role-tagged hex codes via section-aware regex
 *   3. Map to seeds (primary, foreground, background, destructive, radius)
 *   4. `buildTokenSet(seeds, "light")` → light TokenSet
 *   5. `deriveDarkFromLight(light)` → dark TokenSet
 *   6. AA-validate every required fg/bg pair; nudge L until ≥4.5:1
 *   7. Compose a Theme + brand metadata + the verbatim brief
 *   8. Validate via `strictThemeSchema`
 *   9. Render `packages/themes/src/presets/<slug>.ts`
 *  10. Append to `packages/themes/src/presets/index.ts`
 *  11. Append a status row to `.context/voltagent-import.md`
 *
 * No network calls, no API keys — the parser is deterministic.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
	buildTokenSet,
	colorInputToTokenValue,
	contrastRatio,
	deriveDarkFromLight,
	deriveForegroundFor,
	type TokenSetSeeds,
} from "@hex-core/tokens";
import {
	type ColorToken,
	strictThemeSchema,
	type Theme,
	type ThemeCategory,
	type TokenSet,
} from "@hex-core/registry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.join(ROOT, ".cache/getdesign-templates");
const PRESETS_DIR = path.join(ROOT, "packages/themes/src/presets");
const AUDIT_LOG = path.join(ROOT, ".context/voltagent-import.md");

const ATTRIBUTION_URL = "https://github.com/voltagent/awesome-design-md";
const ATTRIBUTION_SOURCE = "voltagent/awesome-design-md";
const ATTRIBUTION_LICENSE = "MIT";

interface ManifestEntry {
	brand: string;
	file: string;
	description: string;
	templateHash: string;
	sourceCommit: string;
	sourceUpdatedAt: string;
}

const CATEGORY_MAP: Record<string, ThemeCategory> = {
	// AI / LLM
	claude: "ai",
	cohere: "ai",
	elevenlabs: "ai",
	minimax: "ai",
	"mistral.ai": "ai",
	ollama: "ai",
	"opencode.ai": "ai",
	replicate: "ai",
	runwayml: "ai",
	"together.ai": "ai",
	voltagent: "ai",
	"x.ai": "ai",
	// Dev tools
	cursor: "dev-tools",
	expo: "dev-tools",
	lovable: "dev-tools",
	raycast: "dev-tools",
	superhuman: "dev-tools",
	vercel: "dev-tools",
	warp: "dev-tools",
	// Backend / DB
	clickhouse: "backend",
	composio: "backend",
	hashicorp: "backend",
	mongodb: "backend",
	posthog: "backend",
	sanity: "backend",
	sentry: "backend",
	supabase: "backend",
	// Productivity
	cal: "productivity",
	intercom: "productivity",
	"linear.app": "productivity",
	mintlify: "productivity",
	notion: "productivity",
	resend: "productivity",
	slack: "productivity",
	zapier: "productivity",
	// Design
	airtable: "design",
	clay: "design",
	figma: "design",
	framer: "design",
	miro: "design",
	webflow: "design",
	// Fintech
	binance: "fintech",
	coinbase: "fintech",
	kraken: "fintech",
	mastercard: "fintech",
	revolut: "fintech",
	stripe: "fintech",
	wise: "fintech",
	// E-commerce
	airbnb: "ecommerce",
	meta: "ecommerce",
	nike: "ecommerce",
	shopify: "ecommerce",
	starbucks: "ecommerce",
	// Media
	apple: "media",
	ibm: "media",
	nvidia: "media",
	pinterest: "media",
	playstation: "media",
	spacex: "media",
	spotify: "media",
	theverge: "media",
	uber: "media",
	vodafone: "media",
	wired: "media",
	// Automotive
	bmw: "automotive",
	"bmw-m": "automotive",
	bugatti: "automotive",
	ferrari: "automotive",
	lamborghini: "automotive",
	renault: "automotive",
	tesla: "automotive",
};

/** Brand → human label override. Falls back to title-casing the slug. */
const DISPLAY_NAMES: Record<string, string> = {
	"linear.app": "Linear",
	"mistral.ai": "Mistral",
	"opencode.ai": "OpenCode",
	"together.ai": "Together AI",
	"x.ai": "xAI",
	bmw: "BMW",
	"bmw-m": "BMW M",
	ibm: "IBM",
	nvidia: "NVIDIA",
	cal: "Cal.com",
	playstation: "PlayStation",
	spacex: "SpaceX",
	theverge: "The Verge",
	wired: "WIRED",
	hashicorp: "HashiCorp",
	clickhouse: "ClickHouse",
	mongodb: "MongoDB",
	posthog: "PostHog",
	elevenlabs: "ElevenLabs",
	runwayml: "RunwayML",
	voltagent: "VoltAgent",
};

interface HexEntry {
	section: string;
	subsection: string;
	name: string;
	hex: string;
	description: string;
}

/**
 * Parse a brief and return every "**<name>** (`#<hex>`): description"
 * line, each tagged with its containing `## n. <section>` and
 * `### <subsection>`. We later score these by the description tokens
 * to assign each hex to a token role.
 */
function parseHexEntries(markdown: string): HexEntry[] {
	const entries: HexEntry[] = [];
	let section = "";
	let subsection = "";
	const lines = markdown.split("\n");
	// Four formats observed across the briefs (add more here when new
	// formats surface; the post-extraction low-score warning surfaces
	// silent format drift):
	//   A) Tesla-style:    `- **Name** (`#XXXXXX`): description`
	//   B) Tesla-inline:   `- **Name** `#XXXXXX`: description`
	//   C) Claude-style:   `- **Name** (`{colors.role}` — #XXXXXX): description`
	//   D) Notion-style:   `- **Name** (`rgba(R,G,B,A)` / `#XXXXXX`): description`
	// The em dash in C may be `—` (U+2014), `–` (U+2013), or `-`. The
	// hex may live inside or outside the parens, before or after a
	// reference token. Order matters: C is greedy and would swallow
	// D's trailing hex if checked first.
	const formatA = /^\s*-\s+\*\*([^*]+)\*\*\s*\(`#([0-9a-fA-F]{3,8})`\)\s*:?\s*(.*)$/;
	const formatB = /^\s*-\s+\*\*([^*]+)\*\*\s*`#([0-9a-fA-F]{3,8})`\s*:?\s*(.*)$/;
	const formatD =
		/^\s*-\s+\*\*([^*]+)\*\*\s*\(`rgba\([^)]+\)`\s*\/\s*`#([0-9a-fA-F]{3,8})`\)\s*:?\s*(.*)$/;
	const formatC =
		/^\s*-\s+\*\*([^*]+)\*\*\s*\([^)]*?[—–-]\s*#([0-9a-fA-F]{3,8})\s*\)\s*:?\s*(.*)$/;

	for (const line of lines) {
		const sectMatch = /^##\s+\d+\.\s+(.+)$/.exec(line);
		if (sectMatch) {
			section = sectMatch[1].toLowerCase();
			subsection = "";
			continue;
		}
		const subMatch = /^###\s+(.+)$/.exec(line);
		if (subMatch) {
			subsection = subMatch[1].toLowerCase();
			continue;
		}
		const m =
			formatA.exec(line) ??
			formatB.exec(line) ??
			formatD.exec(line) ??
			formatC.exec(line);
		if (m) {
			entries.push({
				section,
				subsection,
				name: m[1].trim(),
				hex: `#${m[2]}`,
				description: m[3].trim(),
			});
		}
	}
	return entries;
}

/**
 * Assign a score for how well an extracted hex entry fits a given
 * token role. Higher score wins. Combines section keywords +
 * subsection keywords + bullet-description keywords.
 */
function scoreForRole(entry: HexEntry, role: TokenRole): number {
	const haystack = [entry.section, entry.subsection, entry.name, entry.description]
		.join(" ")
		.toLowerCase();
	const keywords = ROLE_KEYWORDS[role];
	let score = 0;
	for (const [kw, weight] of keywords) {
		if (haystack.includes(kw)) score += weight;
	}
	const negatives = ROLE_NEGATIVE_KEYWORDS[role];
	if (negatives) {
		for (const [kw, weight] of negatives) {
			if (haystack.includes(kw)) score -= weight;
		}
	}
	return score;
}

type TokenRole = "primary" | "foreground" | "background" | "destructive";

const ROLE_KEYWORDS: Record<TokenRole, Array<[string, number]>> = {
	primary: [
		["primary cta", 12],
		["primary button", 10],
		["primary brand", 9],
		["primary action", 8],
		["primary color", 6],
		["brand color", 6],
		["accent color", 4],
		["cta", 6],
		["call to action", 6],
		["primary", 4],
		["brand", 3],
		["accent", 2],
	],
	foreground: [
		["primary heading", 10],
		["heading", 7],
		["primary text", 9],
		["body text", 7],
		["text color", 5],
		["primary content", 6],
		["foreground", 8],
		["text", 3],
		["dark", 2],
	],
	background: [
		["page background", 12],
		["background", 9],
		["canvas", 7],
		["surface", 4],
		["white", 5],
		["primary surface", 6],
	],
	destructive: [
		["error", 10],
		["destructive", 12],
		["delete", 6],
		["danger", 8],
		["red", 4],
		["alert", 5],
		["warning", 3],
	],
};

const ROLE_NEGATIVE_KEYWORDS: Partial<Record<TokenRole, Array<[string, number]>>> = {
	background: [
		["text", 5],
		["heading", 5],
		["foreground", 6],
	],
	foreground: [
		["background", 5],
		["surface", 4],
		["fill", 3],
	],
	primary: [
		["destructive", 8],
		["error", 6],
		["danger", 5],
	],
};

/**
 * Pick the best hex for a given role. Returns the best entry plus its
 * confidence score (so the audit log can flag low-confidence picks for
 * manual review). `null` when no entry scored above zero — caller
 * falls back to a derived default.
 */
function pickRole(
	entries: HexEntry[],
	role: TokenRole,
): { entry: HexEntry; score: number } | null {
	let best: { entry: HexEntry; score: number } | null = null;
	for (const entry of entries) {
		const score = scoreForRole(entry, role);
		if (score <= 0) continue;
		if (!best || score > best.score) best = { entry, score };
	}
	return best;
}

/**
 * Extract a CSS radius (rem or px → rem) from the brief. Falls back
 * to the canonical balanced preset (`0.5rem`) when the brief doesn't
 * specify a numeric radius.
 */
function extractRadius(markdown: string): string {
	const remMatch = /(?:border[-\s]?radius|radius)[^\n]*?(\d+(?:\.\d+)?)\s*rem/i.exec(markdown);
	if (remMatch) {
		const r = Number(remMatch[1]);
		if (r >= 0 && r <= 2) return `${r}rem`;
	}
	const pxMatch = /(?:border[-\s]?radius|radius)[^\n]*?(\d+(?:\.\d+)?)\s*px/i.exec(markdown);
	if (pxMatch) {
		const px = Number(pxMatch[1]);
		const rem = Math.max(0, Math.min(px / 16, 2));
		return `${rem.toFixed(3).replace(/\.?0+$/, "")}rem`;
	}
	return "0.5rem";
}

const FALLBACK_LIGHT_BACKGROUND = "0 0% 100%"; // pure white
const FALLBACK_LIGHT_FOREGROUND = "240 10% 4%"; // near-black with cool tint
const FALLBACK_DESTRUCTIVE = "0 65% 43%"; // matches default theme post-a11y fix
const FALLBACK_PRIMARY = "222 25% 18%"; // graphite

/**
 * Convert a `#RRGGBB` to the canonical hex-core HSL-triplet token
 * value. Throws on parse failures (we feed only validated bullet
 * extractions in).
 */
function hexToTokenValue(hex: string): string {
	const value = colorInputToTokenValue(hex);
	if (!value) throw new Error(`Failed to parse hex: ${hex}`);
	return value;
}

interface ExtractionResult {
	seeds: TokenSetSeeds;
	usedHex: Partial<Record<TokenRole, string>>;
	fellBack: TokenRole[];
	lowConfidence: TokenRole[];
}

/** Below this score, the hex pick is more likely a coincidence than intent. */
const LOW_CONFIDENCE_THRESHOLD = 5;

/**
 * Build the 5-seed bag from the parsed brief, falling back to safe
 * defaults for any role the brief didn't articulate. The audit log
 * records which roles fell back AND which roles came from a
 * low-confidence pick (score < {@link LOW_CONFIDENCE_THRESHOLD}) so
 * future format drift surfaces loudly instead of silently producing
 * wrong-intent themes.
 */
function extractSeeds(markdown: string): ExtractionResult {
	const entries = parseHexEntries(markdown);
	const usedHex: Partial<Record<TokenRole, string>> = {};
	const fellBack: TokenRole[] = [];
	const lowConfidence: TokenRole[] = [];

	const primaryPick = pickRole(entries, "primary");
	const fgPick = pickRole(entries, "foreground");
	const bgPick = pickRole(entries, "background");
	const destructivePick = pickRole(entries, "destructive");

	const trackPick = (
		role: TokenRole,
		pick: { entry: HexEntry; score: number } | null,
		fallback: string,
	): string => {
		if (!pick) {
			fellBack.push(role);
			return fallback;
		}
		if (pick.score < LOW_CONFIDENCE_THRESHOLD) lowConfidence.push(role);
		usedHex[role] = pick.entry.hex;
		return hexToTokenValue(pick.entry.hex);
	};

	const primary = trackPick("primary", primaryPick, FALLBACK_PRIMARY);
	const foreground = trackPick("foreground", fgPick, FALLBACK_LIGHT_FOREGROUND);
	const background = trackPick("background", bgPick, FALLBACK_LIGHT_BACKGROUND);
	const destructive = trackPick("destructive", destructivePick, FALLBACK_DESTRUCTIVE);

	const radius = extractRadius(markdown);

	// Sanity: foreground and background must contrast — pick whichever
	// is darker as foreground if the parser inverted them.
	const fgL = parseLightness(foreground);
	const bgL = parseLightness(background);
	let finalFg = foreground;
	const finalBg = background;
	if (fgL !== null && bgL !== null && Math.abs(fgL - bgL) < 30) {
		// Too close — fall back so we still produce a usable theme.
		finalFg = bgL > 50 ? FALLBACK_LIGHT_FOREGROUND : "0 0% 95%";
		fellBack.push("foreground");
		delete usedHex.foreground;
	}

	return {
		seeds: {
			primary,
			foreground: finalFg,
			background: finalBg,
			destructive,
			radius,
		},
		usedHex,
		fellBack,
		lowConfidence,
	};
}

function parseLightness(value: string): number | null {
	const m = /^[\d.]+\s+[\d.]+%\s+([\d.]+)%$/.exec(value.trim());
	return m ? Number(m[1]) : null;
}

/**
 * Walk every required fg/bg pair on a built TokenSet and patch any
 * pair that misses 4.5:1 (for body text) or 3:1 (for UI surfaces).
 * Re-derives the foreground via `deriveForegroundFor` against a
 * canonical near-white / near-black seed so the patch always lands
 * on a known-good value.
 */
const REQUIRED_PAIRS: Array<[bg: string, fg: string, minimum: number]> = [
	["background", "foreground", 4.5],
	["card", "card-foreground", 4.5],
	["popover", "popover-foreground", 4.5],
	["primary", "primary-foreground", 4.5],
	["secondary", "secondary-foreground", 4.5],
	["muted", "muted-foreground", 4.5],
	["accent", "accent-foreground", 4.5],
	["destructive", "destructive-foreground", 4.5],
];

function aaPatch(set: TokenSet, log: string[], scope: string): TokenSet {
	const out: TokenSet = { ...set };
	for (const [bgKey, fgKey, minimum] of REQUIRED_PAIRS) {
		const bg = out[bgKey] as ColorToken | undefined;
		const fg = out[fgKey] as ColorToken | undefined;
		if (!bg || !fg) continue;
		const ratio = contrastRatio(fg.value, bg.value);
		if (ratio >= minimum) continue;
		const patched = patchToMinimumContrast(bg.value, minimum);
		out[fgKey] = { value: patched, type: "color" };
		const newRatio = contrastRatio(patched, bg.value);
		log.push(
			`  - ${scope}: ${fgKey} on ${bgKey} was ${ratio.toFixed(2)}:1 → patched to ${newRatio.toFixed(2)}:1`,
		);
	}
	return out;
}

/**
 * Pick a foreground that hits at least `minimum` contrast against `bg`.
 * First tries the canonical near-white / near-black via
 * `deriveForegroundFor`; if neither clears the threshold (happens on
 * muddy-mid-luminance brand primaries like Webflow's #4353FF), walks
 * lightness toward 0% or 100% until the threshold lands. Always
 * terminates because absolute black/white guarantee max contrast.
 */
function patchToMinimumContrast(bg: string, minimum: number): string {
	const initial = deriveForegroundFor(bg);
	if (contrastRatio(initial.value, bg) >= minimum) return initial.value;

	const initL = parseLightness(initial.value) ?? 50;
	// initial picked the better candidate — if it was light (near-white),
	// push it lighter; if dark (near-black), push it darker.
	const stepDirection = initL > 50 ? 1 : -1;
	const initialMatch = /^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/.exec(initial.value.trim());
	if (!initialMatch) return initial.value;
	const h = initialMatch[1];
	const s = Number(initialMatch[2]);
	let l = initL;
	for (let step = 0; step < 25; step++) {
		l += stepDirection * 2;
		if (l <= 0 || l >= 100) {
			return `${h} ${s}% ${stepDirection > 0 ? 100 : 0}%`;
		}
		const candidate = `${h} ${s}% ${l}%`;
		if (contrastRatio(candidate, bg) >= minimum) return candidate;
	}
	// Hard fallback: pure white/black guarantees max contrast.
	return stepDirection > 0 ? "0 0% 100%" : "0 0% 0%";
}

function pascalSlug(slug: string): string {
	return slug
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.split(" ")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function camelSlug(slug: string): string {
	const p = pascalSlug(slug);
	return p.charAt(0).toLowerCase() + p.slice(1);
}

function safeSlug(brand: string): string {
	// "linear.app" → "linear", "x.ai" → "x" — strip TLDs to keep
	// import names ergonomic. "bmw-m" stays as "bmw-m".
	const stripped = brand.replace(/\.(app|ai|com)$/i, "");
	return stripped.toLowerCase();
}

function displayNameFor(brand: string): string {
	if (DISPLAY_NAMES[brand]) return DISPLAY_NAMES[brand];
	const slug = safeSlug(brand);
	return slug
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function tagsFor(brand: string, category: ThemeCategory): string[] {
	const base: string[] = [category];
	const overrides: Record<string, string[]> = {
		tesla: ["minimalist", "monochrome", "automotive"],
		stripe: ["fintech", "saturated", "purple"],
		linear: ["productivity", "minimalist", "indigo"],
		notion: ["productivity", "warm", "earthy"],
		claude: ["ai", "warm", "terracotta"],
		apple: ["minimalist", "premium", "white-space"],
	};
	const slug = safeSlug(brand);
	if (overrides[slug]) return overrides[slug];
	return base;
}

function renderTokenLine(name: string, token: { value: string; type: string }): string {
	const key = /^[a-z][a-z0-9]*$/i.test(name) ? name : `"${name}"`;
	return `\t\t\t${key}: { value: ${JSON.stringify(token.value)}, type: ${JSON.stringify(token.type)} },`;
}

function renderTokenSet(set: TokenSet): string {
	// Filter out shared (typography / spacing) tokens — those will be
	// added back via `...sharedTokens` import in the rendered file.
	const lines: string[] = [];
	for (const [name, token] of Object.entries(set)) {
		// Heuristic: shared tokens are non-color/radius keys carried in
		// every theme. We re-add via spread, so omit them here.
		if (token.type === "color" || token.type === "radius") {
			lines.push(renderTokenLine(name, token));
		}
	}
	return lines.join("\n");
}

function renderPresetTs(args: {
	slug: string;
	camelName: string;
	displayName: string;
	description: string;
	category: ThemeCategory;
	tags: string[];
	light: TokenSet;
	dark: TokenSet;
	sourceCommit: string;
	sourceUpdatedAt: string;
}): string {
	const {
		slug,
		camelName,
		displayName,
		description,
		category,
		tags,
		light,
		dark,
		sourceCommit,
		sourceUpdatedAt,
	} = args;

	// P2: do NOT inline `designBrief: <slug>Brief` here. The brief is a
	// separate deep-import (`@hex-core/themes/presets/_briefs/<slug>`)
	// loaded lazily via `loadThemeBrief(slug)` so the top-level barrel
	// stays tree-shakeable. `Theme.designBrief` remains an optional
	// schema field — consumers who need it call the lazy loader.
	//
	// P8: do NOT emit a redundant top-level `brand` field — `displayName`
	// is the brand label and `attribution.brand` is the legal trademark
	// notice. Single source of truth per axis.
	return `// AUTO-GENERATED by scripts/import-voltagent.ts — do not hand-edit.
// Source: voltagent/awesome-design-md (MIT) — ${ATTRIBUTION_URL}
// Brief commit: ${sourceCommit}
// Brief updated: ${sourceUpdatedAt}
//
// Style reference inspired by ${displayName}'s publicly visible design system.
// Hex UI is not affiliated with, endorsed by, or sponsored by ${displayName}.
// Re-run \`pnpm import:themes\` to regenerate from the latest briefs.
import type { Theme } from "@hex-core/registry";
import { sharedTokens } from "@hex-core/tokens";

export const ${camelName}Theme: Theme = {
\tname: ${JSON.stringify(slug)},
\tdisplayName: ${JSON.stringify(displayName)},
\tdescription: ${JSON.stringify(description)},
\tcategory: ${JSON.stringify(category)},
\ttags: ${JSON.stringify(tags)},
\tattribution: {
\t\tsource: ${JSON.stringify(ATTRIBUTION_SOURCE)},
\t\tlicense: ${JSON.stringify(ATTRIBUTION_LICENSE)},
\t\turl: ${JSON.stringify(ATTRIBUTION_URL)},
\t\tbrand: ${JSON.stringify(displayName)},
\t},
\ttokens: {
\t\tlight: {
${renderTokenSet(light)}
\t\t\t...sharedTokens,
\t\t},
\t\tdark: {
${renderTokenSet(dark)}
\t\t\t...sharedTokens,
\t\t},
\t},
};
`;
}

function renderBriefTs(varName: string, brief: string): string {
	// Use a String.raw template literal so the original markdown survives
	// verbatim (no \n / \t / backtick interpretation needed for this set
	// of templates — confirmed empirically against the 71 inputs).
	const escaped = brief.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
	return `// AUTO-GENERATED — do not hand-edit. Source: ${ATTRIBUTION_URL}
export const ${varName} = \`${escaped}\`;
`;
}

interface PresetReport {
	brand: string;
	slug: string;
	category: ThemeCategory;
	usedHex: Partial<Record<TokenRole, string>>;
	fellBack: TokenRole[];
	lowConfidence: TokenRole[];
	patches: string[];
}

function main(): void {
	if (!fs.existsSync(TEMPLATES_DIR) || !fs.existsSync(path.join(TEMPLATES_DIR, "manifest.json"))) {
		throw new Error(
			`Templates dir missing or empty: ${TEMPLATES_DIR}.\n` +
				`Run \`pnpm import:themes:fetch\` to download briefs from getdesign@latest, then re-run \`pnpm import:themes\`.`,
		);
	}
	const manifestPath = path.join(TEMPLATES_DIR, "manifest.json");
	const manifest: ManifestEntry[] = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

	fs.mkdirSync(PRESETS_DIR, { recursive: true });
	const briefsDir = path.join(PRESETS_DIR, "_briefs");
	fs.mkdirSync(briefsDir, { recursive: true });

	const reports: PresetReport[] = [];
	const presetExports: Array<{ slug: string; camelName: string; brand: string; category: ThemeCategory }> = [];
	const skippedNoCategory: string[] = [];

	for (const entry of manifest) {
		const category = CATEGORY_MAP[entry.brand];
		if (!category) {
			skippedNoCategory.push(entry.brand);
			continue;
		}
		const slug = safeSlug(entry.brand);
		const camelName = camelSlug(slug);
		const briefVar = `${camelName}Brief`;
		const briefPath = path.join(TEMPLATES_DIR, entry.file);
		const brief = fs.readFileSync(briefPath, "utf8");

		const { seeds, usedHex, fellBack, lowConfidence } = extractSeeds(brief);
		const patchLog: string[] = [];

		const lightRaw = buildTokenSet(seeds, "light");
		const light = aaPatch(lightRaw, patchLog, "light");
		const darkRaw = deriveDarkFromLight(light);
		const dark = aaPatch(darkRaw, patchLog, "dark");

		const display = displayNameFor(entry.brand);
		// Validate the COMPOSED theme (with brief + brand) against the
		// strict schema so we catch missing-token issues before writing.
		// The actual rendered preset omits `designBrief` (lazy-loaded
		// elsewhere) — we test the schema here to keep the gate strict.
		const validatorTheme: Theme = {
			name: slug,
			displayName: display,
			description: entry.description,
			category,
			tags: tagsFor(entry.brand, category),
			designBrief: brief,
			attribution: {
				source: ATTRIBUTION_SOURCE,
				license: ATTRIBUTION_LICENSE,
				url: ATTRIBUTION_URL,
				brand: display,
			},
			tokens: { light, dark },
		};
		strictThemeSchema.parse(validatorTheme);

		const briefTs = renderBriefTs(briefVar, brief);
		fs.writeFileSync(path.join(briefsDir, `${slug}.ts`), briefTs);

		const presetTs = renderPresetTs({
			slug,
			camelName,
			displayName: display,
			description: entry.description,
			category,
			tags: tagsFor(entry.brand, category),
			light,
			dark,
			sourceCommit: entry.sourceCommit,
			sourceUpdatedAt: entry.sourceUpdatedAt,
		});
		fs.writeFileSync(path.join(PRESETS_DIR, `${slug}.ts`), presetTs);

		presetExports.push({ slug, camelName, brand: display, category });
		reports.push({
			brand: entry.brand,
			slug,
			category,
			usedHex,
			fellBack,
			lowConfidence,
			patches: patchLog,
		});
	}

	writeBarrel(presetExports);
	writeAuditLog(reports, skippedNoCategory);

	console.log(`✓ Imported ${reports.length} presets to ${path.relative(ROOT, PRESETS_DIR)}/`);
	if (skippedNoCategory.length > 0) {
		console.warn(`⚠ Skipped ${skippedNoCategory.length} brands missing CATEGORY_MAP entries: ${skippedNoCategory.join(", ")}`);
	}
}

function writeBarrel(
	presets: Array<{ slug: string; camelName: string; brand: string; category: ThemeCategory }>,
): void {
	const sorted = [...presets].sort((a, b) => a.slug.localeCompare(b.slug));
	const importLines = sorted
		.map((p) => `import { ${p.camelName}Theme } from "./${p.slug}.js";`)
		.join("\n");
	const exportLines = sorted.map((p) => `export { ${p.camelName}Theme } from "./${p.slug}.js";`).join("\n");

	const themesByCategory: Record<ThemeCategory, string[]> = {
		ai: [],
		"dev-tools": [],
		backend: [],
		productivity: [],
		design: [],
		fintech: [],
		ecommerce: [],
		media: [],
		automotive: [],
	};
	for (const p of sorted) themesByCategory[p.category].push(`${p.camelName}Theme`);

	const recordLines = sorted.map((p) => `\t${JSON.stringify(p.slug)}: ${p.camelName}Theme,`).join("\n");

	// Lazy-loader switch: each case dynamic-imports a single brief
	// chunk so consumers who never call `loadThemeBrief` never pay
	// the ~22KB per-brief cost. This is what makes the top-level
	// `@hex-core/themes` barrel tree-shakeable.
	const briefCaseLines = sorted
		.map(
			(p) =>
				`\t\tcase ${JSON.stringify(p.slug)}: return (await import("./_briefs/${p.slug}.js")).${p.camelName}Brief;`,
		)
		.join("\n");

	const out = `// AUTO-GENERATED by scripts/import-voltagent.ts — do not hand-edit.
// Source: voltagent/awesome-design-md (MIT) — ${ATTRIBUTION_URL}
import type { Theme, ThemeCategory } from "@hex-core/registry";
${importLines}

${exportLines}

/** Every voltagent-derived preset, keyed by slug. */
export const voltagentPresets: Record<string, Theme> = {
${recordLines}
};

/** Presets grouped by category for category-aware UIs (Studio's grid). */
export const presetsByCategory: Record<ThemeCategory, readonly Theme[]> = {
${(Object.entries(themesByCategory) as Array<[ThemeCategory, string[]]>)
	.map(([cat, names]) => `\t${JSON.stringify(cat)}: [${names.join(", ")}],`)
	.join("\n")}
};

/** All preset slugs in alphabetical order. */
export const presetSlugs: readonly string[] = [
${sorted.map((p) => `\t${JSON.stringify(p.slug)},`).join("\n")}
];

/**
 * Lazily load the original markdown design brief for a preset.
 *
 * Briefs are NOT inlined on the preset object — the top-level
 * \`@hex-core/themes\` barrel stays tree-shakeable. Studio's
 * \`/studio/copy\` flow (the only consumer that actually needs the
 * brief) calls this on demand; agents that just want token data
 * never pay the ~22KB-per-brief cost.
 *
 * @param slug - Preset slug (e.g. \`"tesla"\`, \`"stripe"\`)
 * @returns The brief markdown, or \`undefined\` for unknown slugs.
 */
export async function loadThemeBrief(slug: string): Promise<string | undefined> {
	switch (slug) {
${briefCaseLines}
\t\tdefault: return undefined;
\t}
}
`;
	fs.writeFileSync(path.join(PRESETS_DIR, "index.ts"), out);
}

function writeAuditLog(reports: PresetReport[], skipped: string[]): void {
	const dir = path.dirname(AUDIT_LOG);
	fs.mkdirSync(dir, { recursive: true });
	const lines: string[] = [];
	lines.push("# voltagent → @hex-core/themes import audit");
	lines.push("");
	lines.push(`Generated: ${new Date().toISOString()}`);
	lines.push(`Templates source: \`.cache/getdesign-templates/\` (getdesign npm package)`);
	lines.push(`Total presets: ${reports.length}`);
	if (skipped.length > 0) {
		lines.push(`Skipped (no CATEGORY_MAP entry): ${skipped.join(", ")}`);
	}
	const lowConfTotal = reports.reduce((sum, r) => sum + r.lowConfidence.length, 0);
	if (lowConfTotal > 0) {
		lines.push(
			`Low-confidence picks (parser ambiguity — review): ${lowConfTotal} across ${reports.filter((r) => r.lowConfidence.length > 0).length} preset(s)`,
		);
	}
	lines.push("");
	lines.push(
		"| Slug | Category | Primary | Foreground | Background | Destructive | Fallbacks | Low conf. | AA Patches |",
	);
	lines.push("|---|---|---|---|---|---|---|---|---|");
	for (const r of reports) {
		const used = (k: TokenRole) => r.usedHex[k] ?? "—";
		const lowConf = r.lowConfidence.length > 0 ? r.lowConfidence.join(", ") : "—";
		lines.push(
			`| \`${r.slug}\` | ${r.category} | ${used("primary")} | ${used("foreground")} | ${used("background")} | ${used("destructive")} | ${r.fellBack.length > 0 ? r.fellBack.join(", ") : "none"} | ${lowConf} | ${r.patches.length} |`,
		);
	}
	lines.push("");
	const withPatches = reports.filter((r) => r.patches.length > 0);
	if (withPatches.length > 0) {
		lines.push("## AA-patch detail (foregrounds replaced via deriveForegroundFor)");
		lines.push("");
		for (const r of withPatches) {
			lines.push(`### ${r.slug}`);
			for (const p of r.patches) lines.push(p);
			lines.push("");
		}
	}
	const withLowConf = reports.filter((r) => r.lowConfidence.length > 0);
	if (withLowConf.length > 0) {
		lines.push("## Low-confidence picks (review for parser misses or new brief formats)");
		lines.push("");
		for (const r of withLowConf) {
			lines.push(`- \`${r.slug}\`: ${r.lowConfidence.join(", ")}`);
		}
		lines.push("");
	}
	fs.writeFileSync(AUDIT_LOG, lines.join("\n") + "\n");
}

main();
