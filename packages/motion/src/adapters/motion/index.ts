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

export class MotionAdapterMissingError extends Error {
	constructor() {
		super(
			"@hex-core/motion/adapters/motion requires the `motion` peer dependency. Install it with `pnpm add motion` (or `npm i motion`).",
		);
		this.name = "MotionAdapterMissingError";
	}
}

let cached: Record<string, unknown> | null = null;

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
export async function getMotionPro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.motion;
}

export async function getPresencePro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.AnimatePresence;
}

export async function getLayoutGroup(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.LayoutGroup;
}

export async function getReorder(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.Reorder;
}

export async function getUseAnimatePro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.useAnimate;
}

export async function getUseScrollPro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.useScroll;
}

export async function getUseMotionValuePro(): Promise<unknown> {
	const mod = await loadMotionAdapter();
	return mod.useMotionValue;
}

export type { MotionProType, PresenceProType } from "./types.js";
