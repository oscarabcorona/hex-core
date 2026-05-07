import { buildKeyframes, type AnimateProps, type Transition } from "./keyframes.js";

/**
 * A Driver turns (`from`, `to`, `transition`) into a running, controllable
 * animation on a DOM element. The default driver wraps WAAPI; the css-var
 * driver mirrors the active values onto `--motion-*` custom properties so
 * non-JS layers (Tailwind variants, child elements) can react too.
 */
export interface RunningAnimation {
	finished: Promise<void>;
	pause(): void;
	play(): void;
	cancel(): void;
	seek(timeMs: number): void;
}

export interface DriverContext {
	reduce?: boolean;
}

export interface Driver {
	animate(
		element: Element,
		from: AnimateProps,
		to: AnimateProps,
		transition: Transition,
		ctx?: DriverContext,
	): RunningAnimation;
}

/**
 * Wrap a raw WAAPI Animation in our control surface. We expose `seek` so
 * the timeline composer can drive multiple clips off a shared clock.
 * @param anim - Native `Animation` returned by `Element.animate(...)`.
 * @returns A `RunningAnimation` exposing the same lifecycle in our shape.
 */
function fromAnimation(anim: Animation): RunningAnimation {
	const finished: Promise<void> = (anim.finished as Promise<unknown>).then(() => undefined);
	return {
		finished,
		pause: () => anim.pause(),
		play: () => anim.play(),
		cancel: () => anim.cancel(),
		seek: (timeMs) => {
			anim.currentTime = timeMs;
		},
	};
}

export const waapiDriver: Driver = {
	animate(element, from, to, transition, ctx = {}) {
		const built = buildKeyframes(from, to, transition, ctx.reduce ?? false);
		const anim = element.animate(built.keyframes, built.options);
		return fromAnimation(anim);
	},
};

/**
 * Mirror end-state values onto `--motion-*` CSS variables on the host.
 * Useful for theming/composition where the parent element drives a token
 * that descendants pick up via Tailwind arbitrary values.
 */
export const cssVarDriver: Driver = {
	animate(element, from, to, transition, ctx = {}) {
		const inner = waapiDriver.animate(element, from, to, transition, ctx);
		if (element instanceof HTMLElement) {
			for (const [key, value] of Object.entries(to)) {
				if (value === undefined) continue;
				element.style.setProperty(`--motion-${key}`, String(value));
			}
		}
		return inner;
	},
};
