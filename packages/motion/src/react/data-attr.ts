import type { AnimateProps, Transition } from "../engine/keyframes.js";
import type { EasingName } from "../engine/easing.js";

/**
 * Hyperframes-inspired declarative attribute. Lets non-React surfaces
 * (server-rendered HTML, MDX, Storybook docs) opt into a motion preset
 * without authoring a Motion component.
 *
 * Syntax: `name;key:value;key:value`. Whitespace between segments is
 * tolerated. Unknown keys are ignored — same-input/same-output stays
 * deterministic so a parser change never silently drops behavior.
 *
 * Built-in named presets:
 *   - "fade-in"   → opacity 0 → 1
 *   - "fade-out"  → opacity 1 → 0
 *   - "slide-up"  → y +24 → 0
 *   - "slide-down"→ y -24 → 0
 *   - "scale-in"  → scale 0.95 → 1, opacity 0 → 1
 */
export interface ParsedMotion {
	from: AnimateProps;
	to: AnimateProps;
	transition: Transition;
}

const PRESETS: Record<string, Pick<ParsedMotion, "from" | "to">> = {
	"fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
	"fade-out": { from: { opacity: 1 }, to: { opacity: 0 } },
	"slide-up": { from: { y: 24, opacity: 0 }, to: { y: 0, opacity: 1 } },
	"slide-down": { from: { y: -24, opacity: 0 }, to: { y: 0, opacity: 1 } },
	"scale-in": { from: { scale: 0.95, opacity: 0 }, to: { scale: 1, opacity: 1 } },
};

const KEY_ALIASES: Record<string, keyof Transition> = {
	dur: "duration",
	duration: "duration",
	delay: "delay",
	easing: "easing",
	ease: "easing",
	iterations: "iterations",
	fill: "fill",
};

/**
 * Parse a `data-hex-motion` attribute value into a `(from, to, transition)`
 * triple ready to feed the engine. Returns `null` for unknown presets
 * (i.e. anything not in `PRESETS`) so callers can no-op gracefully.
 * @param input - Raw attribute value, e.g. `"slide-up; dur:240; ease:standard"`.
 * @returns Parsed motion descriptor, or `null` when the preset is unknown.
 */
export function parseMotionDataAttr(input: string | null | undefined): ParsedMotion | null {
	if (!input) return null;
	const segments = input
		.split(";")
		.map((s) => s.trim())
		.filter(Boolean);
	if (!segments.length) return null;
	const presetName = segments[0];
	const preset = PRESETS[presetName];
	if (!preset) return null;
	const transition: Transition = {};
	for (const seg of segments.slice(1)) {
		const colon = seg.indexOf(":");
		if (colon === -1) continue;
		const rawKey = seg.slice(0, colon).trim();
		const rawValue = seg.slice(colon + 1).trim();
		const key = KEY_ALIASES[rawKey];
		if (!key) continue;
		if (key === "easing") {
			transition.easing = rawValue as EasingName;
		} else if (key === "fill") {
			transition.fill = rawValue as FillMode;
		} else {
			const num = Number(rawValue);
			if (!Number.isNaN(num)) transition[key] = num;
		}
	}
	return { from: preset.from, to: preset.to, transition };
}
