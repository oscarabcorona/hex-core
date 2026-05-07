/**
 * Type bridges for the optional motion@^11 adapter. Kept structurally
 * thin (`unknown` factories) so the package builds even when the
 * `motion` peer is absent — consumers who install `motion` and import
 * this subpath get the real types via the dynamic require boundary in
 * `index.ts`.
 */
export type MotionProType = unknown;
export type PresenceProType = unknown;
