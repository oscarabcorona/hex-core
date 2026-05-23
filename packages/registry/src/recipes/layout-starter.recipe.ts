import type { RecipeDefinition } from "../recipe-schema.js";

/**
 * Layout starter — not a feature scaffold. Bundles every primitive an
 * agent typically needs to compose a multi-page app (page width, vertical
 * rhythm, responsive grids, breadcrumbs, timelines, empty states, etc.)
 * so the agent doesn't fall back to hand-rolled `space-y-*`,
 * `grid sm:grid-cols-2`, and `<div className="rounded-lg border …">`.
 *
 * Real-session AI-onboarding feedback: an agent shipped a Next.js app
 * using only interactive primitives and hand-rolled every layout, then
 * realized container/stack/grid/cluster/spacer/empty/timeline/tag/badge/
 * breadcrumb had been in the registry the whole time. This recipe surfaces
 * them all in one shot via `hex recipe add layout-starter`.
 *
 * Renamed from `app-shell` so the canonical `app-shell` slug belongs to the
 * AppShell layout block — slug discovery (CLI / MCP) now maps "app shell" to
 * the component, and this primitives bundle reads as what it is.
 */
export const layoutStarterRecipe: RecipeDefinition = {
	slug: "layout-starter",
	title: "Layout starter — layout primitives bundle",
	summary:
		"Twelve foundational layout + atom primitives an agent typically needs when scaffolding a real app. Install once, then compose rather than hand-rolling `space-y-*` chains, `grid sm:grid-cols-*` breakpoints, dashed empty-state divs, or `rounded-full border` badge spans.",
	tags: ["layout", "starter", "foundation", "primitives"],
	brief:
		"Drop in the layout primitives an agent forgets — container width, vertical stack, responsive grid, breadcrumb back-links, timeline, empty state — so composition wins over hand-rolled utility chains.",
	steps: [
		{ component: "container", reason: "Constrain page width — replaces hand-rolled `mx-auto max-w-*`", role: "primary" },
		{ component: "stack", reason: "Vertical rhythm — replaces `space-y-*` utility chains", role: "primary" },
		{ component: "cluster", reason: "Horizontal wrap with gap — replaces `flex flex-wrap gap-*`", role: "primary" },
		{ component: "grid", reason: "Responsive grid — `cols='auto-fit'` replaces breakpoint variants", role: "primary" },
		{ component: "spacer", reason: "Explicit vertical gap when stack/cluster don't fit", role: "supporting" },
		{ component: "empty", reason: "Empty-state UI — replaces dashed `border-dashed` divs", role: "primary" },
		{ component: "card", reason: "Standard card surface — never roll `rounded-lg border bg-card` by hand", role: "primary" },
		{ component: "separator", reason: "Visual divider tied to `--border` token", role: "supporting" },
		{ component: "badge", reason: "Status chip — replaces `rounded-full border text-xs` spans", role: "supporting" },
		{ component: "tag", reason: "Filter / topic chip variant of badge", role: "supporting" },
		{ component: "timeline", reason: "Chronological list — replaces hand-rolled `<ol>` + absolute dots", role: "supporting" },
		{ component: "breadcrumb", reason: "Back-link nav — replaces ad-hoc `←` anchors", role: "supporting" },
	],
	checklist: [
		{
			id: "use-container-width",
			check: "Use `<Container size='md'>` for page-width constraints instead of `mx-auto max-w-*`.",
			severity: "warn",
			source: "author",
		},
		{
			id: "use-grid-auto-fit",
			check: "Use `<Grid cols='auto-fit' minColWidth='280px'>` for responsive card grids — no more `sm:grid-cols-2 md:grid-cols-3` breakpoint chains.",
			severity: "warn",
			source: "author",
		},
		{
			id: "use-stack-not-space-y",
			check: "Use `<Stack gap='…'>` for vertical rhythm instead of `space-y-*` utility chains.",
			severity: "warn",
			source: "author",
		},
		{
			id: "use-empty-not-dashed-div",
			check: "Use `<Empty>` for empty states instead of dashed-border divs.",
			severity: "warn",
			source: "author",
		},
		{
			id: "use-breadcrumb-not-anchor",
			check: "Use `<Breadcrumb>` for back-links instead of hand-rolled `←` anchors.",
			severity: "nit",
			source: "author",
		},
		{
			id: "use-timeline-not-ol",
			check: "Use `<Timeline>` for chronological listings instead of `<ol>` + absolute-positioned dots.",
			severity: "nit",
			source: "author",
		},
	],
	tokenBudget: 3200,
};
