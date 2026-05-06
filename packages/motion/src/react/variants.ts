import type { AnimateProps, Transition } from "../engine/keyframes.js";

export interface VariantState extends AnimateProps {
	transition?: Transition;
}

export type Variants = Record<string, VariantState>;

export function resolveVariant(
	variants: Variants | undefined,
	name: string | undefined,
): VariantState | undefined {
	if (!variants || !name) return undefined;
	return variants[name];
}

/** Type-helper so consumers can author variants with inferred AnimateProps shape. */
export function variants<T extends Variants>(map: T): T {
	return map;
}
