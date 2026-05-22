import { tokenEasing, type EasingName } from "./easing.js";

/**
 * Subset of CSS properties the engine animates directly. Sticking to
 * compositor-friendly props (transform/opacity/color) keeps the WAAPI
 * driver hardware-accelerated; layout-affecting props are out of scope
 * (use the motion adapter for FLIP/layout animations).
 */
export interface AnimateProps {
	x?: number | string;
	y?: number | string;
	scale?: number;
	rotate?: number | string;
	opacity?: number;
	backgroundColor?: string;
	color?: string;
	/** CSS `filter` value (e.g. `blur(8px)`), passed through verbatim — used by the blur-in catalog wrapper. */
	filter?: string;
}

export interface Transition {
	/** Duration in milliseconds. Numbers stay numbers; CSS string ms also accepted. */
	duration?: number;
	delay?: number;
	easing?: EasingName | string;
	iterations?: number;
	fill?: FillMode;
}

const TRANSFORM_KEYS: ReadonlyArray<keyof AnimateProps> = ["x", "y", "scale", "rotate"];

/**
 * Coerce a number to `<n><unit>` while passing strings through unchanged.
 * @param v - The numeric value or pre-formatted string.
 * @param unit - CSS unit suffix to append when `v` is numeric.
 * @returns The formatted CSS string, or `undefined` when `v` is missing.
 */
function asUnit(v: number | string | undefined, unit: string): string | undefined {
	if (v === undefined) return undefined;
	if (typeof v === "string") return v;
	return `${v}${unit}`;
}

/**
 * Compose the CSS `transform` value from translate/scale/rotate inputs.
 * @param props - Animate-prop subset that may contain x/y/scale/rotate.
 * @returns A `transform` value, or `undefined` when none of the keys are set.
 */
function buildTransform(props: AnimateProps): string | undefined {
	const parts: string[] = [];
	const tx = asUnit(props.x, "px");
	const ty = asUnit(props.y, "px");
	if (tx !== undefined || ty !== undefined) {
		parts.push(`translate3d(${tx ?? "0px"}, ${ty ?? "0px"}, 0)`);
	}
	if (props.scale !== undefined) parts.push(`scale(${props.scale})`);
	const rot = asUnit(props.rotate, "deg");
	if (rot !== undefined) parts.push(`rotate(${rot})`);
	return parts.length ? parts.join(" ") : undefined;
}

/**
 * Translate `AnimateProps` to a single WAAPI `Keyframe`.
 * @param props - Animate state to serialize.
 * @returns The `Keyframe` ready to feed `Element.animate(...)`.
 */
function frameFromProps(props: AnimateProps): Keyframe {
	const frame: Keyframe = {};
	const transform = buildTransform(props);
	if (transform) frame.transform = transform;
	if (props.opacity !== undefined) frame.opacity = props.opacity;
	if (props.backgroundColor !== undefined) frame.backgroundColor = props.backgroundColor;
	if (props.color !== undefined) frame.color = props.color;
	if (props.filter !== undefined) frame.filter = props.filter;
	return frame;
}

/**
 * Detect whether a key in `to` materially differs from `from`. Used by
 * the engine to skip animations that are no-ops; also lets the timeline
 * composer keep its descriptor list stable across re-renders.
 * @param from - Starting prop set.
 * @param to - Target prop set.
 * @returns `true` when at least one key differs (after default-to-0 for
 *          transform keys); otherwise `false`.
 */
export function hasAnimatableDiff(from: AnimateProps, to: AnimateProps): boolean {
	const keys = new Set<keyof AnimateProps>([
		...(Object.keys(from) as Array<keyof AnimateProps>),
		...(Object.keys(to) as Array<keyof AnimateProps>),
	]);
	for (const k of keys) {
		if (TRANSFORM_KEYS.includes(k)) {
			if ((from[k] ?? 0) !== (to[k] ?? 0)) return true;
		} else if (from[k] !== to[k]) {
			return true;
		}
	}
	return false;
}

export interface BuiltKeyframes {
	keyframes: Keyframe[];
	options: KeyframeAnimationOptions;
}

/**
 * Build a (from, to) WAAPI pair. When `reduce` is true the keyframes
 * collapse to `[to, to]` and duration drops to 0 — visually instant but
 * still semantically a one-shot animation, so `finished` resolves and
 * any `onFinish` handlers still fire.
 * @param from - Starting state.
 * @param to - Target state.
 * @param transition - Duration / delay / easing / iterations / fill.
 * @param reduce - When true, collapses to `[to, to]` for prefers-reduced-motion.
 * @returns The keyframes and `KeyframeAnimationOptions` ready to pass to WAAPI.
 */
export function buildKeyframes(
	from: AnimateProps,
	to: AnimateProps,
	transition: Transition = {},
	reduce = false,
): BuiltKeyframes {
	const fromFrame = frameFromProps(from);
	const toFrame = frameFromProps(to);
	const duration = reduce ? 0 : (transition.duration ?? 200);
	return {
		keyframes: reduce ? [toFrame, toFrame] : [fromFrame, toFrame],
		options: {
			duration,
			delay: transition.delay ?? 0,
			easing: tokenEasing(transition.easing),
			iterations: transition.iterations ?? 1,
			fill: transition.fill ?? "both",
		},
	};
}
