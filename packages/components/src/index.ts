/**
 * Public runtime API for `@hex-core/components`.
 *
 * The export list is generated from the filesystem by
 * `scripts/build-barrels.ts` — adding a component to
 * `src/{primitive|component|ai|artifact|block}/<slug>/` and running
 * `pnpm run build:barrels` is all it takes to publish it. Nothing here is
 * hand-maintained, which is the point: this list had drifted out of sync
 * with the schema barrel by 53 entries before it was generated.
 *
 * To keep an export out of the public API, tag its declaration
 * `@internal` — the generator skips those.
 */
export * from "./index.generated.js";
