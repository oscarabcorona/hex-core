import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/*
 * jsdom doesn't implement the Web Animations API (Element.prototype.animate).
 * The motion engine drives every animation through it, so a tiny shim that
 * mirrors the WAAPI surface we actually use is the bare minimum for tests.
 *
 * The shim is deterministic: time advances only via the manualClock the
 * engine injects in tests; no rAF wall-clock leaks. Production code paths
 * never see this shim — it lives only in the vitest setup.
 */
type ShimKeyframeOptions = {
	duration?: number;
	delay?: number;
	easing?: string;
	fill?: FillMode;
	iterations?: number;
};

type ShimAnimation = Animation & {
	__keyframes: Keyframe[];
	__options: ShimKeyframeOptions;
};

if (typeof Element !== "undefined" && typeof Element.prototype.animate !== "function") {
	Element.prototype.animate = function animate(
		this: Element,
		keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
		options?: number | KeyframeAnimationOptions,
	): Animation {
		const opts: ShimKeyframeOptions =
			typeof options === "number" ? { duration: options } : (options ?? {});
		let currentTime: number | null = 0;
		let playState: AnimationPlayState = "idle";
		let resolveFinished: () => void = () => {};
		let finished = new Promise<void>((r) => {
			resolveFinished = r;
		});
		const anim: Partial<ShimAnimation> = {
			__keyframes: Array.isArray(keyframes) ? keyframes : [],
			__options: opts,
			get currentTime() {
				return currentTime;
			},
			set currentTime(t) {
				currentTime = t;
			},
			get playState() {
				return playState;
			},
			play() {
				playState = "running";
			},
			pause() {
				playState = "paused";
			},
			cancel() {
				playState = "idle";
			},
			finish() {
				playState = "finished";
				currentTime = opts.duration ?? 0;
				resolveFinished();
				finished = new Promise<void>((r) => {
					resolveFinished = r;
				});
			},
			get finished(): Promise<Animation> {
				// The stub resolves with no value; nothing under test reads the
				// resolved Animation, so widen the void promise rather than
				// fabricating one.
				return finished.then(() => anim);
			},
			oncancel: null,
			onfinish: null,
		};
		anim.play?.();
		return anim as Animation;
	} as Element["animate"];
}

if (typeof globalThis.matchMedia === "undefined") {
	globalThis.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false,
		}) as MediaQueryList;
}

afterEach(() => {
	cleanup();
});
