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
	/**
	 * CSS `filter` expression — `"blur(8px)"`, `"grayscale(0.5)"`,
	 * `"brightness(1.2)"`, etc. Animated as a raw string keyframe; consumers
	 * compose multi-filter chains by passing the full expression. Used by
	 * `<BlurIn>` and similar wrappers; stays opt-in so the default Motion
	 * composition path remains transform/opacity-only.
	 */
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

function asUnit(v: number | string | undefined, unit: string): string | undefined {
	if (v === undefined) return undefined;
	if (typeof v === "string") return v;
	return `${v}${unit}`;
}

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
