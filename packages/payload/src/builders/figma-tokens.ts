/**
 * `emit_figma_tokens` tool — render a Hex UI theme as a Figma Variables REST
 * payload. Pure function, no I/O. The handler in `index.ts` resolves the theme
 * via `getTheme` and passes it in.
 *
 * The output is a markdown document wrapping a JSON body whose shape matches
 * Figma's `POST /v1/files/:file_key/variables` endpoint:
 *   - one variable collection ("Hex UI — <theme>")
 *   - two modes ("Light", "Dark") so designers can flip mode in Figma to mirror
 *     the consumer app's `:root` ↔ `.dark` cascade
 *   - one variable per token, typed COLOR / FLOAT
 *   - one mode-value per (variable × mode) — the light triplet for the Light
 *     mode and the dark triplet for the Dark mode
 *
 * IDs are temporary `tempId_*` strings as required by the Figma POST API; the
 * server replaces them with real ids on response. Consumer pastes the JSON
 * into a curl call or Figma Variables plugin and gets a populated kit.
 *
 * HSL → RGB conversion is inlined (~30 LOC) instead of taking a runtime dep
 * on `@hex-core/components` (which has a React peer); the canonical impl
 * still lives in `packages/components/src/lib/color.ts` and the docstrings
 * reference it for parity.
 */

import type { TokenValue } from "@hex-core/registry";

/**
 * Subset of theme fields surfaced in the Figma payload. Both palettes are
 * required (matches `themeSchema` shape) and use the canonical `TokenValue`
 * type so a future addition to `tokenTypeEnum` surfaces in this file's
 * type-checking immediately.
 */
export interface FigmaTokensTheme {
	name: string;
	displayName: string;
	tokens: {
		light: Record<string, TokenValue>;
		dark: Record<string, TokenValue>;
	};
}

/** Inputs to `buildFigmaTokens`. Theme is null when the requested slug was unknown. */
export interface FigmaTokensInput {
	theme: { requested: string; resolved: FigmaTokensTheme | null };
}

/** Figma Variables REST POST shape — narrow to the fields we emit. */
export interface FigmaVariablesPayload {
	variableCollections: Array<{
		action: "CREATE";
		id: string;
		name: string;
		initialModeId: string;
	}>;
	variableModes: Array<{
		action: "CREATE";
		id: string;
		name: string;
		variableCollectionId: string;
	}>;
	variables: Array<{
		action: "CREATE";
		id: string;
		name: string;
		variableCollectionId: string;
		resolvedType: "COLOR" | "FLOAT";
	}>;
	variableModeValues: Array<{
		variableId: string;
		modeId: string;
		value: { r: number; g: number; b: number; a?: number } | number;
	}>;
}

/**
 * Parse an HSL triplet string of the form `"<H> <S>% <L>%"` into numeric
 * channels. Mirror of `parseHslTriplet` in `packages/components/src/lib/color.ts`.
 * @param triplet - Raw token value, e.g. `"240 5.9% 10%"`.
 * @returns `{ h, s, l }` in (0–360, 0–100, 0–100) ranges; zeroes on malformed input.
 */
function parseHslTriplet(triplet: string): { h: number; s: number; l: number } {
	const parts = triplet.trim().split(/\s+/);
	return {
		h: Number.parseFloat(parts[0]) || 0,
		s: Number.parseFloat(parts[1]) || 0,
		l: Number.parseFloat(parts[2]) || 0,
	};
}

/**
 * Convert HSL to a 0–1-ranged RGB record matching Figma's `value` shape for
 * COLOR variables. Mirror of `hslToRgb` in `packages/components/src/lib/color.ts`,
 * but ranged 0–1 instead of 0–255 (Figma's API normalizes).
 *
 * Rounding: 4dp ≈ 8-bit precision (256 distinct values per channel) — matches
 * the canonical `hslToRgb` impl which rounds to 0–255 integers. 6dp would be
 * over-precise relative to the source HSL triplets which max out at 1dp.
 * @param h - Hue (0–360).
 * @param s - Saturation (0–100).
 * @param l - Lightness (0–100).
 * @returns RGB channels in 0–1 range, suitable for `variableModeValues[].value`.
 */
function hslToFigmaRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
	const sN = s / 100;
	const lN = l / 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = sN * Math.min(lN, 1 - lN);
	const f = (n: number) => lN - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
	const round = (n: number) => Math.round(n * 10000) / 10000;
	return { r: round(f(0)), g: round(f(8)), b: round(f(4)) };
}

/**
 * Convert a non-color token value (e.g. `0.5rem`, `200ms`, `2.5rem`) into
 * Figma's FLOAT representation. Figma stores floats unitless, so we resolve to
 * a base unit per category:
 *   - rem → px (assume 16px base; matches Tailwind / shadcn defaults)
 *   - px  → px
 *   - %   → percent value passes through (so `100%` = 100, not 1.0)
 *   - ms  → ms
 *   - s   → ms (×1000)
 *   - bare numbers → as-is
 * Unparseable values fall back to 0 so a bad token doesn't poison the whole
 * collection (consumer can still POST the rest and patch the missing ones).
 * @param raw - Token value as authored in `tokens/themes/*.ts`.
 * @returns Numeric float in Figma's expected shape.
 */
function parseFloatToken(raw: string): number {
	const trimmed = raw.trim();
	const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*(rem|px|%|ms|s)?$/i);
	if (!match) return 0;
	const n = Number.parseFloat(match[1]);
	const unit = match[2]?.toLowerCase();
	if (unit === "rem") return n * 16;
	if (unit === "s") return n * 1000;
	// px / ms / % / bare — value passes through verbatim
	return n;
}

/**
 * Token types that map cleanly to Figma's `FLOAT` variable resolved type.
 * Tokens carrying types outside this set (e.g. `shadow`, `gradient`,
 * `cubicBezier`) are SKIPPED rather than coerced to `0` via `parseFloatToken`'s
 * fallback — fail-loud beats silent corruption here. The skipped slugs surface
 * in the markdown header so designers see what didn't transfer.
 */
const FLOAT_SAFE_TYPES: ReadonlySet<TokenValue["type"]> = new Set([
	"dimension",
	"font",
	"fontWeight",
	"duration",
	"number",
	"radius",
	"spacing",
	"opacity",
]);

/**
 * Map a token category to a Figma variable resolved type, or `null` if Figma
 * can't faithfully represent the type as a primitive Variable.
 * @param category - Token's `type` field from `tokenTypeEnum`.
 * @returns `"COLOR"` for color tokens, `"FLOAT"` for FLOAT-safe scalar tokens,
 *   `null` for tokens that should be skipped (`shadow`, `gradient`, `cubicBezier`).
 */
function resolvedTypeFor(category: TokenValue["type"]): "COLOR" | "FLOAT" | null {
	if (category === "color") return "COLOR";
	if (FLOAT_SAFE_TYPES.has(category)) return "FLOAT";
	return null;
}

/**
 * Build a Figma `tempId_*` value. Figma accepts `[a-zA-Z0-9_]+` for ids;
 * token names use hyphens (`primary-foreground`), so we replace any
 * non-conforming character with `_`. The hyphen survives in the variable's
 * free-form `name` field, which Figma allows.
 *
 * Broad regex anticipates future tokens with capitals or unicode in slugs;
 * today only `-` is touched in practice.
 * @param prefix - Slot label (e.g. `"var"`, `"collection"`).
 * @param key - Token name as authored in the theme.
 * @returns A safe id string usable as a temporary identifier in the POST body.
 */
function tempId(prefix: string, key: string): string {
	return `tempId_${prefix}_${key.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

/**
 * Result of `buildFigmaPayload` — payload plus the slugs we deliberately
 * skipped because Figma can't faithfully represent their type as a primitive
 * Variable. Caller surfaces `skipped` in the markdown header so designers see
 * what didn't transfer.
 */
export interface FigmaPayloadResult {
	payload: FigmaVariablesPayload;
	skipped: Array<{ key: string; type: TokenValue["type"] }>;
}

/**
 * Build a Figma Variables REST POST payload from a resolved theme.
 *
 * Iterates the **union** of light + dark keys so dark-only tokens (e.g. a
 * dark-mode-exclusive `glow-color`) land in the kit. The shape `themeSchema`
 * declares is `Record<string, TokenValue>` per palette — there's no runtime
 * refinement asserting parity, so we treat asymmetric palettes as legal.
 *
 * For each token name the function emits one variable plus zero, one, or two
 * mode-values (one per palette that actually carries the key). Tokens whose
 * `type` Figma can't represent (`shadow`, `gradient`, `cubicBezier`) are
 * skipped and reported via `skipped` so the caller can surface them in the
 * markdown header — a silent zero-value FLOAT fall-through would be worse.
 * @param theme - Resolved theme with both palettes.
 * @returns Payload + skipped-tokens list.
 */
export function buildFigmaPayload(theme: FigmaTokensTheme): FigmaPayloadResult {
	const collectionId = tempId("collection", theme.name);
	const lightModeId = "tempId_mode_light";
	const darkModeId = "tempId_mode_dark";

	// Collection name uses an en-dash for human readability ("Hex UI — Default").
	// If consumers ever script against the name and need a slug-friendly form,
	// the collection id (`tempId_collection_<theme.name>`) is already safe.
	const variableCollections: FigmaVariablesPayload["variableCollections"] = [
		{
			action: "CREATE",
			id: collectionId,
			name: `Hex UI — ${theme.displayName}`,
			initialModeId: lightModeId,
		},
	];

	const variableModes: FigmaVariablesPayload["variableModes"] = [
		{
			action: "CREATE",
			id: lightModeId,
			name: "Light",
			variableCollectionId: collectionId,
		},
		{
			action: "CREATE",
			id: darkModeId,
			name: "Dark",
			variableCollectionId: collectionId,
		},
	];

	const variables: FigmaVariablesPayload["variables"] = [];
	const variableModeValues: FigmaVariablesPayload["variableModeValues"] = [];
	const skipped: FigmaPayloadResult["skipped"] = [];

	// Object.entries iteration order is guaranteed for string keys (ECMA-262);
	// snapshot tests depend on it. Preserve the source order: walk light first
	// so its keys come first in the payload, then append any dark-only keys.
	const lightKeys = Object.keys(theme.tokens.light);
	const darkOnlyKeys = Object.keys(theme.tokens.dark).filter(
		(k) => !(k in theme.tokens.light),
	);
	const allKeys = [...lightKeys, ...darkOnlyKeys];

	for (const key of allKeys) {
		const tokenL = theme.tokens.light[key];
		const tokenD = theme.tokens.dark[key];
		// First-defined token's type wins (light if present, else dark).
		// Both palettes should agree on type per convention; if they don't,
		// light's wins arbitrarily — same as how CSS-cascade merges them.
		const sourceToken = tokenL ?? tokenD;
		if (!sourceToken) continue; // Defensive — both undefined can't happen given allKeys derivation.

		const resolvedType = resolvedTypeFor(sourceToken.type);
		if (resolvedType === null) {
			skipped.push({ key, type: sourceToken.type });
			continue;
		}

		const variableId = tempId("var", key);
		variables.push({
			action: "CREATE",
			id: variableId,
			name: key,
			variableCollectionId: collectionId,
			resolvedType,
		});

		const toValue = (raw: string): { r: number; g: number; b: number } | number => {
			if (resolvedType === "COLOR") {
				const { h, s, l } = parseHslTriplet(raw);
				return hslToFigmaRgb(h, s, l);
			}
			return parseFloatToken(raw);
		};

		if (tokenL) {
			variableModeValues.push({
				variableId,
				modeId: lightModeId,
				value: toValue(tokenL.value),
			});
		}
		if (tokenD) {
			variableModeValues.push({
				variableId,
				modeId: darkModeId,
				value: toValue(tokenD.value),
			});
		}
	}

	return {
		payload: { variableCollections, variableModes, variables, variableModeValues },
		skipped,
	};
}

/**
 * Build a deterministic markdown payload describing the chosen theme as a
 * Figma Variables REST POST body. Pasting the JSON into Figma's plugin or
 * the REST endpoint produces a populated variable kit (one collection, two
 * modes, one variable per token).
 * @param input - Resolved theme record (null signals "not found").
 * @returns Markdown string with embedded JSON suitable for paste-into-Figma workflows.
 */
export function buildFigmaTokens(input: FigmaTokensInput): string {
	const lines: string[] = [];

	lines.push("# Figma tokens — Hex UI");
	lines.push("");
	lines.push(
		"Generated by `emit_figma_tokens`. Paste the JSON below into Figma's `POST /v1/files/:file_key/variables` endpoint (or a Figma plugin that calls it) to populate a Variables collection that mirrors the theme.",
	);
	lines.push("");

	if (!input.theme.resolved) {
		lines.push(
			`**Unknown theme** \`${input.theme.requested}\` — fall back to \`default\` and notify the user. No JSON emitted.`,
		);
		return lines.join("\n");
	}

	const t = input.theme.resolved;
	const { payload, skipped } = buildFigmaPayload(t);

	lines.push(`## Theme — ${t.displayName} \`${t.name}\``);
	lines.push("");

	if (payload.variables.length === 0) {
		// Empty payload would be syntactically valid (Figma accepts empty
		// variables[] arrays) but pragmatically useless — the caller would
		// POST it and get an empty collection. Fail loud, skip the JSON
		// block, and tell the operator what to fix.
		lines.push(
			`**No variables emitted** — the resolved theme carries no Figma-representable tokens (color, dimension, font, fontWeight, duration, number, radius, spacing, opacity). ${skipped.length > 0 ? `${skipped.length} token(s) were skipped — see below.` : "Check that the theme actually defines tokens."}`,
		);
		if (skipped.length > 0) {
			lines.push("");
			lines.push("## Skipped tokens");
			lines.push("");
			for (const { key, type } of skipped) {
				lines.push(`- \`${key}\` (type: \`${type}\`) — Figma can't faithfully represent this type as a primitive Variable.`);
			}
		}
		return lines.join("\n");
	}

	const colorCount = payload.variables.filter((v) => v.resolvedType === "COLOR").length;
	const floatCount = payload.variables.length - colorCount;
	lines.push(
		`Collection: **${payload.variableCollections[0].name}**. Modes: **Light** + **Dark**. Variables: **${payload.variables.length}** (${colorCount} COLOR, ${floatCount} FLOAT). Mode-values: **${payload.variableModeValues.length}**.`,
	);

	if (skipped.length > 0) {
		lines.push("");
		lines.push(
			`> **Skipped:** ${skipped.map(({ key, type }) => `\`${key}\` (\`${type}\`)`).join(", ")} — Figma can't faithfully represent these types as primitive Variables.`,
		);
	}

	lines.push("");
	lines.push("## Payload");
	lines.push("");
	lines.push("```json");
	lines.push(JSON.stringify(payload, null, 2));
	lines.push("```");
	lines.push("");
	lines.push("## How to apply");
	lines.push("");
	lines.push(
		"```bash",
		"curl -X POST \\",
		"  -H \"X-Figma-Token: $FIGMA_PAT\" \\",
		"  -H \"Content-Type: application/json\" \\",
		"  -d @hex-tokens.json \\",
		"  https://api.figma.com/v1/files/$FILE_KEY/variables",
		"```",
	);

	return lines.join("\n");
}
