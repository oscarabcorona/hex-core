import type { RecipeDefinition } from "../recipe-schema.js";

export const appPageRecipe: RecipeDefinition = {
	slug: "app-page",
	kind: "page",
	pageType: "app",
	title: "App page",
	summary:
		"An authenticated app dashboard composed from the app shell, sidebar navigation, KPI stats, and a data-table view.",
	tags: ["app", "dashboard", "page", "shell"],
	brief:
		"Build a logged-in app screen: an AppShell frame wrapping an AppSidebarNav in the sidebar slot, with the main region holding a row of AppStats KPIs above an AppDataTable list. Keep page content in Server Components and pass it as the shell's children; only the shell and any interactive controls are client-side. Use semantic tokens so the whole app restyles with the theme.",
	theme: { preset: "default", tokenBudget: 3200 },
	sections: [
		{ id: "shell", block: "app-shell", intent: "The outer frame — fixed sidebar, sticky top bar, scrollable main.", role: "primary" },
		{ id: "nav", block: "app-sidebar-nav", intent: "Primary navigation inside the shell's sidebar slot.", role: "primary" },
		{ id: "stats", block: "app-stats", intent: "Headline KPIs at the top of the main region.", role: "supporting" },
		{ id: "table", block: "app-data-table", intent: "The primary list/table view below the stats.", role: "primary" },
	],
	layout:
		"AppShell is the root. Put AppSidebarNav in its `sidebar` slot and page title + actions in its `header` slot. Inside `children`, stack AppStats first, then AppDataTable. For a settings screen, swap AppDataTable for app-settings. Each block manages its own spacing — separate stacked blocks with a gap on the main region.",
	tokenBudget: 3200,
};
