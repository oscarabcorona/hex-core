/**
 * Token-aware easings. Names mirror the Material/Apple-derived motion
 * vocabulary; the cubic-bezier triples come from `@hex-core/tokens`'s
 * easing slots so a theme swap propagates to animations.
 */
export type EasingName =
	| "linear"
	| "standard"
	| "emphasized"
	| "decelerate"
	| "accelerate"
	| "bounce";

const TOKEN_EASINGS: Record<EasingName, string> = {
	linear: "linear",
	standard: "cubic-bezier(0.2, 0, 0, 1)",
	emphasized: "cubic-bezier(0.3, 0, 0, 1)",
	decelerate: "cubic-bezier(0, 0, 0, 1)",
	accelerate: "cubic-bezier(0.3, 0, 1, 1)",
	bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

/** Resolve an easing token name (or pass through a CSS easing string). */
export function tokenEasing(easing: EasingName | string | undefined): string {
	if (!easing) return TOKEN_EASINGS.standard;
	if (easing in TOKEN_EASINGS) return TOKEN_EASINGS[easing as EasingName];
	return easing;
}

/**
 * Approximate a critically-damped spring as a cubic-bezier. Useful when
 * the WAAPI driver is in play (no spring physics) but the consumer wants
 * a spring-feel transition. Faithful enough for UI; not for physics demos.
 */
export function springToBezier(opts?: { stiffness?: number; damping?: number }): string {
	const stiffness = opts?.stiffness ?? 170;
	const damping = opts?.damping ?? 26;
	const ratio = damping / (2 * Math.sqrt(stiffness));
	if (ratio >= 1) return TOKEN_EASINGS.standard;
	const overshoot = Math.max(0, 1 - ratio);
	const c1 = 0.2;
	const c2 = Math.min(0.95, 0.6 + overshoot * 0.3);
	return `cubic-bezier(${c1}, 0, ${c2}, 1)`;
}
