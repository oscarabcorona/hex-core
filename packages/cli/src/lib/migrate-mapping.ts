/**
 * shadcn/ui slug → Hex Core slug map. The 36 1:1 pairs cover the entire
 * canonical shadcn surface; the three explicit-null entries are skipped
 * with a warning by `hex migrate`. Keep alphabetized — the table is the
 * one source of truth for what `hex migrate` knows how to convert.
 *
 * `null` (carousel, chart) means "no Hex Core equivalent exists yet — skip
 * with a warning". `toast → sonner` is the one rename: shadcn's toast was
 * deprecated in favor of Sonner; Hex Core ships only the Sonner wrapper.
 *
 * Future v2 ships a `MUI_TO_HEX` and `MANTINE_TO_HEX` table alongside this
 * one — keeping each library's mapping in its own object stays
 * grep-friendly when slugs collide between sources.
 */
export const SHADCN_TO_HEX: Record<string, string | null> = {
	accordion: "accordion",
	alert: "alert",
	"alert-dialog": "alert-dialog",
	"aspect-ratio": "aspect-ratio",
	avatar: "avatar",
	badge: "badge",
	breadcrumb: "breadcrumb",
	button: "button",
	calendar: "calendar",
	card: "card",
	carousel: null,
	chart: null,
	checkbox: "checkbox",
	collapsible: "collapsible",
	combobox: "combobox",
	command: "command",
	"context-menu": "context-menu",
	"data-table": "data-table",
	"date-picker": "date-picker",
	dialog: "dialog",
	drawer: "drawer",
	"dropdown-menu": "dropdown-menu",
	form: "form",
	"hover-card": "hover-card",
	input: "input",
	"input-otp": "input-otp",
	label: "label",
	menubar: "menubar",
	"navigation-menu": "navigation-menu",
	pagination: "pagination",
	popover: "popover",
	progress: "progress",
	"radio-group": "radio-group",
	resizable: "resizable",
	"scroll-area": "scroll-area",
	select: "select",
	separator: "separator",
	sheet: "sheet",
	sidebar: "sidebar",
	skeleton: "skeleton",
	slider: "slider",
	sonner: "sonner",
	switch: "switch",
	table: "table",
	tabs: "tabs",
	textarea: "textarea",
	toast: "sonner",
	toggle: "toggle",
	"toggle-group": "toggle-group",
	tooltip: "tooltip",
};

/**
 * Reasons surfaced in the migrate report when a shadcn slug is skipped.
 * Keyed by the shadcn slug (not the Hex Core slug) so the same lookup
 * fits both null entries and "renamed but caller wants context" cases.
 */
export const SKIP_REASONS: Record<string, string> = {
	carousel: "no Hex Core equivalent — track the issue or roll your own",
	chart: "no Hex Core equivalent — try the artifacts/* family for richer alternatives",
};
