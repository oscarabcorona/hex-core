import type { AnimateProps, Transition } from "../engine/keyframes.js";

export interface VariantState extends AnimateProps {
	transition?: Transition;
}

export type Variants = Record<string, VariantState>;

/**
 * Look up a named variant from a `Variants` map. Returns `undefined` for
 * missing variants OR when either argument is missing — Motion treats
 * "no resolved variant" as "no animation" rather than throwing.
 * @param variants - Optional variant dictionary.
 * @param name - Optional variant key.
 * @returns The matching `VariantState`, or `undefined` if not found.
 */
export function resolveVariant(
	variants: Variants | undefined,
	name: string | undefined,
): VariantState | undefined {
	if (!variants || !name) return undefined;
	return variants[name];
}

/**
 * Type-helper so consumers can author variants with inferred AnimateProps shape.
 * @param map - Variants object literal.
 * @returns The same map, narrowed to its literal type.
 */
export function variants<T extends Variants>(map: T): T {
	return map;
}
