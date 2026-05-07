/**
 * Time source for the motion engine. Decoupling `now()` and the rAF loop
 * from `performance.now()` is what lets tests (and the deterministic
 * timeline) advance time in fixed steps without flakiness.
 */
export interface Clock {
	now(): number;
	schedule(cb: (t: number) => void): () => void;
}

export const realtimeClock: Clock = {
	now: () => (typeof performance !== "undefined" ? performance.now() : Date.now()),
	schedule(cb) {
		const id = requestAnimationFrame((t) => cb(t));
		return () => cancelAnimationFrame(id);
	},
};

export interface ManualClock extends Clock {
	advance(ms: number): void;
	set(t: number): void;
}

/**
 * Test-friendly `Clock` whose time is advanced explicitly via `advance(ms)`
 * or `set(t)`. Animations driven by it never depend on `requestAnimationFrame`,
 * so a single `advance(16)` reliably fires the callbacks the runtime version
 * would only fire on the next paint.
 * @param initial - Starting `now()` value. Defaults to 0.
 * @returns Manual clock with deterministic advance/set hooks.
 */
export function manualClock(initial = 0): ManualClock {
	let t = initial;
	const callbacks = new Set<(t: number) => void>();
	return {
		now: () => t,
		schedule(cb) {
			callbacks.add(cb);
			return () => callbacks.delete(cb);
		},
		advance(ms) {
			t += ms;
			for (const cb of [...callbacks]) cb(t);
		},
		set(next) {
			t = next;
			for (const cb of [...callbacks]) cb(t);
		},
	};
}
