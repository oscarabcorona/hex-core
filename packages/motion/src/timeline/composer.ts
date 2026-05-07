import type { ClipDescriptor } from "./context.js";

export interface TimelineNode {
	id: string;
	target?: string;
	track?: string;
	start?: number;
	duration?: number;
	from?: Partial<ClipDescriptor["from"]>;
	to?: Partial<ClipDescriptor["to"]>;
	easing?: string;
	delay?: number;
	children?: TimelineNode[];
}

/**
 * Walk a timeline tree and yield absolute-time clip descriptors. Pure
 * — no DOM access, no clock — so the same tree always produces the
 * same descriptor list. The deterministic timing test depends on this
 * staying side-effect-free.
 *
 * Scene `start`/`duration` are absolute window offsets (relative to the
 * parent's `t0`); Clip `start` is relative to its enclosing Scene.
 * Missing values default to 0 so a bare `<Clip target="#x" to={...}/>`
 * runs immediately for the timeline's full duration.
 * @param node - Root TimelineNode (typically the `<Timeline>` itself,
 *               but recursive descendants pass child nodes here).
 * @param parentT0 - Absolute start time inherited from the parent.
 *                   Defaults to 0 for the root call.
 * @returns Flattened list of `ClipDescriptor`s ready to drive the engine.
 */
export function composeTimeline(node: TimelineNode, parentT0 = 0): ClipDescriptor[] {
	const t0 = parentT0 + (node.start ?? 0);
	const out: ClipDescriptor[] = [];

	if (node.target && node.to) {
		const t1 = t0 + (node.duration ?? 0);
		out.push({
			id: node.id,
			target: node.target,
			track: node.track,
			from: { ...(node.from ?? {}) },
			to: { ...node.to },
			t0,
			t1,
			transition: {
				duration: node.duration,
				delay: node.delay,
				easing: node.easing,
			},
		});
	}

	for (const child of node.children ?? []) {
		out.push(...composeTimeline(child, t0));
	}

	return out;
}
