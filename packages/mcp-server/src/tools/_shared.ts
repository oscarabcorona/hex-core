import { loadRegistry } from "@hex-core/payload";

/**
 * The catalog every tool reads from, loaded once at module scope.
 *
 * Shared rather than per-tool: `loadRegistry()` walks and parses the whole
 * committed `registry/`, and nineteen tools each doing that at startup
 * would be nineteen times the work for one identical result.
 */
export const registry = loadRegistry();

/**
 * Normalize a thrown value into tool-response text.
 *
 * Used by the agent-builder tools so a missing/invalid catalog graph, an
 * unknown theme, and a catalog defect all surface the same shape
 * (`isError: true` plus the message) instead of three different ones.
 * @param err - The thrown value
 * @returns Human-readable error text
 */
export function toolErrorText(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}
