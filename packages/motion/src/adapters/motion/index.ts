/**
 * Optional adapter that re-exports `motion@^11`'s React API. The motion
 * package is a peer dep, NOT a hard dep — consumers who don't import
 * `@hex-core/motion/adapters/motion` never pay its bundle cost.
 *
 * Resolution is lazy via dynamic import: the first call to
 * `loadMotionAdapter()` resolves the module, caches it, and returns it.
 * If `motion` isn't installed we throw `MotionAdapterMissingError` with
 * the exact install command.
 */

/**
 * Thrown by the motion-adapter loaders when the `motion` peer dep isn't
 * installed. Carries the exact install command in its message so error
 * surfaces (toasts, console traces) can guide users without extra context.
 */
export class MotionAdapterMissingError extends Error {
	/** Build the error with the canonical install hint. */
	constructor() {
		super(
			"@hex-core/motion/adapters/motion requires the `motion` peer dependency. Install it with `pnpm add motion` (or `npm i motion`).",
		);
		this.name = "MotionAdapterMissingError";
	}
}

let cached: Record<string, unknown> | null = null;

/**
 * Lazily resolve `motion/react`. First call resolves + caches the module;
 * subsequent calls return the cache. Throws `MotionAdapterMissingError` if
 * the peer dep isn't installed in the consumer's project.
 * @returns The resolved `motion/react` module exports.
 */
export async function loadMotionAdapter(): Promise<Record<string, unknown>> {
	if (cached) return cached;
	try {
		const mod = (await import(/* @vite-ignore */ "motion/react")) as Record<string, unknown>;
		cached = mod;
		return mod;
	} catch {
		throw new MotionAdapterMissingError();
	}
}

/**
 * Convenience accessors. Each one throws synchronously if the adapter
 * hasn't been awaited yet — the async pattern is opt-in by component.
 */

/**
 * Get `motion`'s `motion` factory (used to wrap intrinsic elements).
 * @returns The `motion` proxy from `motion/react`.
 */
export async function getMotionPro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.motion;
}

/**
 * Get `motion`'s `AnimatePresence`.
 * @returns The `AnimatePresence` component from `motion/react`.
 */
export async function getPresencePro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.AnimatePresence;
}

/**
 * Get `motion`'s `LayoutGroup` (shared-layout coordination).
 * @returns The `LayoutGroup` component from `motion/react`.
 */
export async function getLayoutGroup(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.LayoutGroup;
}

/**
 * Get `motion`'s `Reorder` (drag-to-reorder list utilities).
 * @returns The `Reorder` namespace from `motion/react`.
 */
export async function getReorder(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.Reorder;
}

/**
 * Get `motion`'s `useAnimate` hook.
 * @returns The `useAnimate` hook from `motion/react`.
 */
export async function getUseAnimatePro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.useAnimate;
}

/**
 * Get `motion`'s `useScroll` hook.
 * @returns The `useScroll` hook from `motion/react`.
 */
export async function getUseScrollPro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.useScroll;
}

/**
 * Get `motion`'s `useMotionValue` hook.
 * @returns The `useMotionValue` hook from `motion/react`.
 */
export async function getUseMotionValuePro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.useMotionValue;
}

export type { MotionProType, PresenceProType } from "./types.js";
