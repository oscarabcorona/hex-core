import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const tagSchema: ComponentSchemaDefinition = {
	name: "tag",
	displayName: "Tag",
	description:
		"Interactive tag / chip primitive — Badge with an optional dismiss button. Mirrors Badge's variants so the visual sibling is obvious; ships with a close affordance for filter pills, multi-select selections, draft attachments.",
	category: "primitive",
	subcategory: "feedback",
	props: [
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "default",
			description: "Visual style.",
			enumValues: ["default", "secondary", "destructive", "outline"],
		},
		{
			name: "icon",
			type: "ReactNode",
			required: false,
			description: "Optional leading icon (sized 12x12 inside the tag).",
		},
		{
			name: "onRemove",
			type: "function",
			required: false,
			description: "Click handler for the close button. When provided, the dismiss ✕ is rendered. Signature: () => void.",
		},
		{
			name: "removeLabel",
			type: "string",
			required: false,
			description: "Override the auto-derived close-button aria-label (default: 'Remove ${children}').",
		},
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [
		{
			name: "variant",
			description: "Visual style — mirrors Badge so users get consistent token use.",
			values: [
				{
					value: "default",
					description: "Primary-tinted filled tag.",
					useWhen: "the tag represents an active selected state — applied filter, picked option",
				},
				{
					value: "secondary",
					description: "Muted neutral filled tag with a hairline border.",
					useWhen: "default for everyday tags — list of selected items, draft attachments, filter pills",
				},
				{
					value: "destructive",
					description: "Red-tinted filled tag.",
					useWhen: "the tag represents a flagged / problematic value — banned user, archived item",
				},
				{
					value: "outline",
					description: "Bordered transparent tag.",
					useWhen: "the tag lives on a busy surface and shouldn't add visual fill weight",
				},
			],
			default: "default",
		},
	],
	slots: [
		{
			name: "icon",
			description: "Leading icon (sized 12x12).",
			required: false,
			acceptedTypes: ["ReactNode"],
		},
		{
			name: "children",
			description: "Tag label content (string preferred for auto aria-label derivation).",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["primary", "primary-foreground", "secondary", "secondary-foreground", "destructive", "destructive-foreground", "foreground", "ring"],
	examples: [
		{
			title: "Filter pill with dismiss",
			description: "Removable filter chip in a search bar",
			code: '<Tag variant="secondary" onRemove={() => removeFilter("urgent")}>Urgent</Tag>',
			composition: ["filter", "search", "removable"],
		},
		{
			title: "Multi-select selections",
			description: "Stack of selected values with per-tag dismiss",
			code: '<div className="flex flex-wrap gap-2">\n  {selected.map((tag) => (\n    <Tag key={tag} variant="secondary" onRemove={() => deselect(tag)}>\n      {tag}\n    </Tag>\n  ))}\n</div>',
			composition: ["multi-select", "form", "removable"],
		},
		{
			title: "Status tag (non-interactive)",
			description: "Static tag without dismiss — equivalent to Badge but uses Tag for consistency",
			code: '<Tag variant="outline">Beta</Tag>',
			composition: ["status", "label"],
		},
	],
	ai: {
		whenToUse:
			"Use for tokens the user can dismiss: filter pills, multi-select selections, draft attachments. Pair onRemove with a state setter that drops the value from your collection.",
		whenNotToUse:
			"Don't use for non-interactive labels (use Badge). Don't use for state-bearing 'click to filter' affordances — those should be Toggle or ToggleGroup so the active state is announced as 'pressed'/'not pressed' to assistive tech.",
		commonMistakes: [
			"Forgetting onRemove on a tag the user CAN dismiss — leaves the affordance invisible",
			"Calling it Tag but rendering inside a list of static labels — confuses Tag (interactive) vs Badge (decorative) semantics",
			"Wrapping the tag itself in a <button> — the dismiss button already handles its own click; double-button breaks accessibility",
		],
		antiPatterns: [
			{
				mistake: "Using Tag without onRemove for a static / decorative label",
				insteadUse: "badge",
				why: "Badge is the non-interactive sibling. Tag without onRemove ships an unused close-button container — wasted DOM and ambiguous semantics. Reach for Badge when there's nothing to dismiss.",
			},
			{
				mistake: "Using Tag as a click-to-filter chip (selected vs unselected state)",
				insteadUse: "toggle",
				why: "Toggle's role='button' + aria-pressed announces selected state to AT. Tag's close-button doesn't model 'pressed'; consumers end up with non-announced state.",
			},
			{
				mistake: "Using Tag for a single-select dropdown's chosen value",
				insteadUse: "select",
				why: "Select renders its value text inside the trigger. Tag would duplicate the token and complicate the keyboard nav (focus on Tag's close vs Select's trigger).",
			},
		],
		relatedComponents: ["badge", "toggle", "toggle-group", "multi-combobox"],
		accessibilityNotes:
			"Close button gets aria-label derived from children when they're a string ('Remove Urgent'). Override via removeLabel. Tag itself is a span — wrap in a list (`role='list'` + `role='listitem'`) when rendering N tags as a collection.",
		tokenBudget: 350,
	},
	tags: ["tag", "chip", "pill", "filter", "removable", "multi-select"],
};
