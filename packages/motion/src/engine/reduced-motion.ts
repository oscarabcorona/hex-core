/**
 * `prefers-reduced-motion` adapter. Read once per call; consumers that
 * need reactivity should subscribe via `useReducedMotion` (in /react).
 *
 * Three modes:
 *   "user"   — follow the media query (default).
 *   "always" — force reduced motion regardless of OS setting.
 *   "never"  — never reduce motion (used by screenshot tests + Timeline
 *              determinism guarantees, where collapsing to final-state
 *              would break the same-input/same-output contract).
 */
export type ReducedMotionMode = "user" | "always" | "never";

/**
 * Resolve whether motion should be suppressed for the active mode.
 * @param mode - Decision policy. `"user"` consults the media query;
 *               `"always"`/`"never"` short-circuit. Defaults to `"user"`.
 * @returns `true` when the engine should collapse to the final-state frame.
 */
export function shouldReduceMotion(mode: ReducedMotionMode = "user"): boolean {
	if (mode === "always") return true;
	if (mode === "never") return false;
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
