import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const emptySchema: ComponentSchemaDefinition = {
	name: "empty",
	displayName: "Empty",
	description:
		"A zero-state surface for lists, dashboards, and search results with no content. Explains why the slot is empty + provides a call-to-action.",
	category: "primitive",
	subcategory: "feedback",
	props: [
		{
			name: "icon",
			type: "ReactNode",
			required: false,
			description: "Icon (typically an <svg>) rendered in a circular muted container above the title.",
		},
		{
			name: "title",
			type: "ReactNode",
			required: true,
			description: "Heading copy. Becomes the region's accessible name via aria-labelledby.",
		},
		{
			name: "description",
			type: "ReactNode",
			required: false,
			description: "Supporting copy that explains why the slot is empty + what to do next.",
		},
		{
			name: "action",
			type: "ReactNode",
			required: false,
			description: "Call-to-action — typically a <Button> that creates the missing record.",
		},
		{
			name: "titleAs",
			type: "enum",
			required: false,
			default: "h3",
			description: "Heading level for the title. Pick to match surrounding heading hierarchy.",
			enumValues: ["h2", "h3", "h4", "h5", "h6", "p"],
		},
		{
			name: "size",
			type: "enum",
			required: false,
			default: "default",
			description: "Visual scale.",
			enumValues: ["sm", "default", "lg"],
		},
	],
	variants: [
		{
			name: "size",
			description: "Vertical density of the empty-state surface.",
			values: [
				{
					value: "sm",
					description: "Compact — fits inside a card / panel.",
					useWhen: "the empty surface is one of several stacked pieces of content; full-bleed would dominate",
				},
				{
					value: "default",
					description: "Standard — for table / list / dashboard widget empty states.",
					useWhen: "default everywhere; the only size you need on most surfaces",
				},
				{
					value: "lg",
					description: "Large — for full-page empty states (no items at all yet).",
					useWhen: "the empty surface owns the entire page — onboarding, first-run, no records yet",
				},
			],
			default: "default",
		},
	],
	slots: [
		{
			name: "icon",
			description: "Icon rendered in the circular muted container above the title.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
		{
			name: "action",
			description: "Call-to-action button under the description.",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "muted-foreground", "foreground", "border"],
	examples: [
		{
			title: "List zero-state",
			description: "Inbox with no messages — icon + title + description + compose button",
			code: '<Empty\n  icon={<InboxIcon />}\n  title="No messages yet"\n  description="When someone sends a message, it shows up here."\n  action={<Button>Compose</Button>}\n/>',
			composition: ["zero-state", "list", "with-action"],
		},
		{
			title: "Search zero-state",
			description: "Search returned zero results — show the query + suggest a reset",
			code: '<Empty\n  icon={<SearchIcon />}\n  title="No results found"\n  description={`No items match "${query}". Try a different search.`}\n  action={<Button variant="secondary" onClick={onReset}>Clear search</Button>}\n  size="sm"\n/>',
			composition: ["zero-state", "search"],
		},
		{
			title: "Onboarding",
			description: "Full-page first-run state",
			code: '<Empty\n  icon={<SparklesIcon />}\n  title="Welcome to your dashboard"\n  description="Create your first project to get started."\n  action={<Button size="lg">Create project</Button>}\n  size="lg"\n  titleAs="h1"\n/>',
			composition: ["zero-state", "onboarding", "first-run"],
		},
	],
	ai: {
		whenToUse:
			"Use for lists, search results, or dashboards where the request returned successfully but there's nothing to show. Explain why and what to do — the title names the absence, the description sets context, the action gives a way out.",
		whenNotToUse:
			"Don't use while data is still loading (use Loading). Don't use when something failed (use ErrorState). Don't use for inline form-field 'no options' messages (use Combobox's empty slot or Form's helper text).",
		commonMistakes: [
			"Using Empty without an action — leaves the user stuck",
			"Long descriptions — keep to one sentence; this is a state surface, not documentation",
			"Forgetting titleAs when the page already has an h2 above (heading hierarchy break)",
		],
		antiPatterns: [
			{
				mistake: "Using Empty while data is still being fetched",
				insteadUse: "loading",
				why: "Empty announces 'no items exist'; Loading announces 'fetching items.' Showing Empty during the fetch flashes a misleading 'no results' state then snaps to real data on resolution.",
			},
			{
				mistake: "Using Empty to display a fetch failure",
				insteadUse: "error-state",
				why: "ErrorState carries role='alert' so screen readers announce the failure on first render, AND it ships a retry affordance. Empty is silent on retry semantics.",
			},
			{
				mistake: "Using Empty as an inline 'no matching options' notice inside a Combobox or Select",
				insteadUse: "combobox",
				why: "Combobox + Command already render a sub-AA-conformant empty state inside the listbox. Using Empty there leaks the page-level zero-state language into a focused interaction.",
			},
		],
		relatedComponents: ["loading", "error-state", "alert", "card", "skeleton"],
		accessibilityNotes:
			"Wrapped in a region landmark labeled by the title (aria-labelledby + auto-generated id). Icon is decorative (aria-hidden). Pair the action with a Button that has a visible label.",
		tokenBudget: 350,
	},
	tags: ["empty", "zero-state", "feedback", "list", "dashboard"],
};
