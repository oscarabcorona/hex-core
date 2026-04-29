import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const buttonSchema: ComponentSchemaDefinition = {
	name: "button",
	displayName: "Button",
	description:
		"A versatile button component with multiple variants, sizes, and states. Supports icons, loading state, and composition via asChild.",
	category: "primitive",
	subcategory: "actions",
	props: [
		{
			name: "variant",
			type: "enum",
			required: false,
			default: "default",
			description: "The visual style of the button",
			enumValues: ["default", "destructive", "outline", "secondary", "ghost", "link"],
		},
		{
			name: "size",
			type: "enum",
			required: false,
			default: "default",
			description: "The size of the button",
			enumValues: ["default", "sm", "lg", "icon"],
		},
		{
			name: "asChild",
			type: "boolean",
			required: false,
			default: false,
			description:
				"Render as a Slot component, merging props with the child element. Use to render as a link or other element.",
		},
		{
			name: "loading",
			type: "boolean",
			required: false,
			default: false,
			description: "Show loading spinner and disable interaction",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable the button",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes to merge with the component styles",
		},
	],
	variants: [
		{
			name: "variant",
			description: "Visual style variants",
			values: [
				{
					value: "default",
					description: "Primary filled button with subtle shadow for main actions",
					useWhen: "the single most important action on the screen — exactly one per view (Save, Submit, Continue)",
				},
				{
					value: "destructive",
					description: "Red button with shadow for dangerous/irreversible actions",
					useWhen: "the action cannot be undone without recreating data: Delete, Archive, Deactivate, Leave team, Force-quit",
				},
				{
					value: "outline",
					description: "Bordered button with hover fill for secondary actions",
					useWhen: "tertiary actions on a flat (non-elevated) surface; signals 'optional' next to a primary",
				},
				{
					value: "secondary",
					description: "Muted filled button for less prominent actions",
					useWhen: "the second-most-important action next to a primary CTA: Cancel, Save Draft, Skip",
				},
				{
					value: "ghost",
					description: "Transparent button, background appears on hover",
					useWhen: "low-emphasis action inside a list, toolbar, or row where chrome should disappear at rest",
				},
				{
					value: "link",
					description: "Styled as a hyperlink with underline on hover, no padding",
					useWhen: "an inline action inside flowing text, or a 'Learn more' affordance in an empty state",
				},
			],
			default: "default",
		},
		{
			name: "size",
			description: "Size variants",
			values: [
				{
					value: "default",
					description: "Standard size (h-10, px-4)",
					useWhen: "default everywhere; the only size you need on most surfaces",
				},
				{
					value: "sm",
					description: "Compact size (h-9, px-3)",
					useWhen: "buttons living inside a row, toolbar, or table cell where vertical density matters",
				},
				{
					value: "lg",
					description: "Large size (h-11, px-8, text-base)",
					useWhen: "the single hero CTA on a marketing page, pricing card, or empty-state action",
				},
				{
					value: "icon",
					description: "Square icon-only size (h-10, w-10)",
					useWhen: "icon-only actions (close, settings, more). Always pair with aria-label",
				},
			],
			default: "default",
		},
	],
	slots: [
		{
			name: "children",
			description: "Button label content",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["class-variance-authority", "@radix-ui/react-slot", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"primary",
		"primary-foreground",
		"destructive",
		"destructive-foreground",
		"secondary",
		"secondary-foreground",
		"accent",
		"accent-foreground",
		"background",
		"input",
		"ring",
	],
	examples: [
		{
			title: "Basic usage",
			description: "A simple primary button",
			code: "<Button>Click me</Button>",
			composition: ["form-action"],
		},
		{
			title: "Variants",
			description: "Different visual styles",
			code: '<>\n  <Button variant="default">Primary</Button>\n  <Button variant="outline">Outline</Button>\n  <Button variant="secondary">Secondary</Button>\n  <Button variant="ghost">Ghost</Button>\n  <Button variant="destructive">Delete</Button>\n  <Button variant="link">Link</Button>\n</>',
			composition: ["showcase"],
		},
		{
			title: "Destructive confirm in dialog",
			description: "The canonical destructive action, paired with Cancel inside an alert-dialog footer",
			code: '<AlertDialog>\n  <AlertDialogTrigger asChild>\n    <Button variant="outline">Delete account</Button>\n  </AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>\n      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>\n      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>Cancel</AlertDialogCancel>\n      <AlertDialogAction variant="destructive">Delete</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>',
			composition: ["dialog", "alert-dialog", "destructive", "confirm"],
		},
		{
			title: "Form action pair",
			description: "Primary submit + secondary cancel — the universal end-of-form pattern",
			code: '<div className="flex justify-end gap-2">\n  <Button variant="secondary" type="button">Cancel</Button>\n  <Button type="submit">Save changes</Button>\n</div>',
			composition: ["form", "form-action"],
		},
		{
			title: "With loading state",
			description: "Button showing a spinner while loading",
			code: '<Button loading>Submitting...</Button>',
			composition: ["form-action", "async"],
		},
		{
			title: "As link",
			description: "Button rendered as an anchor tag",
			code: '<Button asChild>\n  <a href="/login">Login</a>\n</Button>',
			composition: ["navigation", "as-child"],
		},
		{
			title: "Icon button",
			description: "Square button with just an icon",
			code: '<Button variant="outline" size="icon" aria-label="Settings">\n  <SettingsIcon />\n</Button>',
			composition: ["icon-only", "toolbar"],
		},
		{
			title: "Leading icon",
			description: "Button with an icon before its label — clarifies intent without sacrificing readability",
			code: '<Button>\n  <PlusIcon />\n  Add member\n</Button>',
			composition: ["icon-leading", "form-action"],
		},
	],
	ai: {
		whenToUse:
			"Use for clickable actions: form submissions, confirmations, triggering operations. Use 'default' variant for primary CTAs, 'outline' or 'secondary' for less important actions, 'ghost' for toolbar-style actions.",
		whenNotToUse:
			"Don't use for navigation between pages (use Link or anchor with asChild). Don't use 'destructive' for non-dangerous actions. Don't use for toggling state (use Toggle or Switch).",
		commonMistakes: [
			"Nesting interactive elements inside asChild button",
			"Using <Button> with plain onClick for navigation instead of <Button asChild><a href=...></a></Button> — breaks middle-click, cmd-click, and right-click → 'open in new tab', and skips the browser history entry",
			"Using <Button variant='destructive'> for recoverable actions like 'Reset filters' — reserve destructive for delete/archive/leave; use 'secondary' or 'ghost' for resets",
			"Using <Button size='icon'> without an aria-label — screen readers have nothing to announce; always pair icon-only buttons with aria-label or visible text",
		],
		antiPatterns: [
			{
				mistake: "Using <Button> to flip a boolean state on/off (volume mute, dark mode, airplane mode)",
				insteadUse: "switch",
				why: "Switch communicates the on/off semantic to assistive tech (role=switch + aria-checked). A button announces 'press' which loses the state semantic.",
			},
			{
				mistake: "Using <Button> as a tab to switch between sibling content panels",
				insteadUse: "tabs",
				why: "Tabs ship role=tablist + roving tabindex + arrow-key navigation. Buttons in a row don't — assistive tech will announce them as N independent actions instead of a tab group.",
			},
			{
				mistake: "Using <Button> to expand/collapse a content section",
				insteadUse: "accordion",
				why: "Accordion handles aria-expanded / aria-controls automatically and ships the chevron rotation animation. A bare button doing the same job is missing those affordances.",
			},
		],
		relatedComponents: ["toggle", "toggle-group", "dropdown-menu", "badge"],
		accessibilityNotes:
			"Automatically handles focus ring, disabled state, and aria attributes. Icon-only buttons MUST have aria-label. Loading state automatically sets disabled.",
		tokenBudget: 500,
	},
	tags: ["button", "action", "cta", "form", "interactive", "click"],
};
