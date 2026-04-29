import type { SemanticTokenSet, TokenSet, TokenValue } from "@hex-core/registry";

/**
 * Semantic-token map (added 0.4.0) — the **intent layer** over the raw
 * `defaultTheme` tokens. Each entry references a raw token via flat
 * `{token-name}` syntax (the token name matches the literal key in
 * `defaultTheme.tokens.light` / `.dark`) and adds a `useWhen` sentence
 * describing the UI-element class it's the right choice for.
 *
 * Why this exists: the raw `--color-destructive` ships a value, but an
 * LLM picking a token for "delete button background" has to guess that
 * `destructive` maps to "irreversible action" rather than to "validation
 * error" or "system alert" — those are different design intents that
 * happen to share a hue today. Naming the *intent* lets MCP, Studio, and
 * future LLM workflows reach for the correct token without color-vibe
 * heuristics.
 *
 * Naming convention: `<component>.<state-or-slot>.<role>`. Use
 * `dialog.overlay.bg`, not `dialog-overlay-bg`. The leading segment is
 * the API — MCP groups by it.
 *
 * **Theme-portable.** The map references raw token names by reference
 * (`{destructive}`), so swapping the underlying theme automatically
 * shifts every semantic entry without any per-theme rewrite. Themes that
 * want to redefine semantic intent (e.g. a fintech theme where
 * "destructive" reads more muted) can ship their own `SemanticTokenSet`
 * alongside their `Theme`.
 *
 * **Coverage is intentionally partial.** Common high-leverage intents
 * are named (button, surface, form, feedback, shape, motion); arbitrary
 * combinatorial intents (`table.row.bg-hover`, `badge.intent.warning`)
 * are deferred. Consumers querying an unnamed intent fall through to
 * the raw `defaultTheme` layer.
 */
export const defaultSemanticTokens: SemanticTokenSet = {
	// ─── Button intents ─────────────────────────────────────────────
	"button.primary.bg": {
		value: "{primary}",
		useWhen: "the single most important action on the screen (one per view)",
		type: "color",
	},
	"button.primary.fg": {
		value: "{primary-foreground}",
		useWhen: "text on a primary button",
		type: "color",
	},
	"button.destructive.bg": {
		value: "{destructive}",
		useWhen: "irreversible actions: delete, archive, deactivate, leave, force-quit",
		type: "color",
	},
	"button.destructive.fg": {
		value: "{destructive-foreground}",
		useWhen: "text on a destructive button",
		type: "color",
	},
	"button.secondary.bg": {
		value: "{secondary}",
		useWhen: "the second-tier action next to a primary button (Cancel, Save Draft)",
		type: "color",
	},
	"button.outline.border": {
		value: "{input}",
		useWhen: "tertiary actions on flat surfaces; signals 'optional'",
		type: "color",
	},
	"button.ghost.bg-hover": {
		value: "{accent}",
		useWhen: "lowest-emphasis action; lives inside a list/toolbar where chrome should disappear",
		type: "color",
	},

	// ─── Surface intents ────────────────────────────────────────────
	"surface.card.bg": {
		value: "{card}",
		useWhen: "a content container raised one level above the page background",
		type: "color",
	},
	"surface.popover.bg": {
		value: "{popover}",
		useWhen: "a transient floating layer (dropdown, tooltip body, hover-card) above all content",
		type: "color",
	},
	"surface.muted.bg": {
		value: "{muted}",
		useWhen: "background of a section that should recede (footer, disabled state, code block)",
		type: "color",
	},

	// ─── Form intents ───────────────────────────────────────────────
	"form.field.border": {
		value: "{input}",
		useWhen: "the resting border of a form input, textarea, or select trigger",
		type: "color",
	},
	"form.field.border-error": {
		value: "{destructive}",
		useWhen: "input validation has failed and the field needs visual correction",
		type: "color",
	},
	"form.field.ring-focus": {
		value: "{ring}",
		useWhen: "the keyboard-focus ring on any focusable form control",
		type: "color",
	},
	"form.message.error-fg": {
		value: "{destructive}",
		useWhen: "inline error text below a failed field",
		type: "color",
	},

	// ─── Feedback intents ───────────────────────────────────────────
	"feedback.success.bg": {
		value: "{primary}",
		useWhen: "success toast / banner background. Note: default theme reuses primary; opinionated themes should split this from primary",
		type: "color",
	},
	"feedback.error.bg": {
		value: "{destructive}",
		useWhen: "error toast / banner background",
		type: "color",
	},
	"feedback.muted.fg": {
		value: "{muted-foreground}",
		useWhen: "secondary copy: helper text, captions, timestamps, empty-state body",
		type: "color",
	},

	// ─── Shape + motion intents ─────────────────────────────────────
	"shape.radius.control": {
		value: "{radius}",
		useWhen: "the corner radius of any interactive control (button, input, badge, chip)",
		type: "radius",
	},
	"motion.duration.control": {
		value: "{duration-normal}",
		useWhen: "hover, press, and focus transitions on interactive controls",
		type: "duration",
	},
	"motion.duration.overlay": {
		value: "{duration-slow}",
		useWhen: "dialog/sheet/drawer enter+exit; longer to telegraph the surface change",
		type: "duration",
	},
};

/**
 * Resolve a `{token-name}` reference against a `TokenSet` and return
 * the underlying `TokenValue`, or `null` if the reference doesn't
 * match a token in the set. Single-hop lookup — no recursion, no
 * fallback chains.
 *
 * Use this when an MCP/Studio surface needs the resolved value
 * (e.g. to render a swatch next to the semantic name) rather than the
 * `{ref}` placeholder string.
 *
 * @example
 * ```ts
 * import { defaultSemanticTokens, defaultTheme, resolveSemanticToken } from "@hex-core/tokens";
 *
 * const entry = defaultSemanticTokens["button.destructive.bg"];
 * const resolved = resolveSemanticToken(entry.value, defaultTheme.tokens.light);
 * // resolved → { value: "0 84% 60%", type: "color" }
 * ```
 */
export function resolveSemanticToken(
	reference: string,
	tokenSet: TokenSet,
): TokenValue | null {
	const match = /^\{([a-z][a-z0-9-]*)\}$/.exec(reference);
	if (!match) return null;
	const slug = match[1];
	if (!slug) return null;
	const value = tokenSet[slug];
	return value ?? null;
}

