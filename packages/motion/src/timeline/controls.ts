/**
 * Re-exports for ergonomic consumer imports. The actual controls live
 * on the value returned by `useTimeline()` so the Timeline component
 * owns the state — these helpers are for code that already has the
 * value in hand and wants to call methods imperatively.
 */
export { useTimeline } from "./context.js";
export type { TimelineContextValue } from "./context.js";
