import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const appSettingsSchema: ComponentSchemaDefinition = {
	name: "app-settings",
	displayName: "AppSettings",
	description:
		"Settings page layout: a stack of groups, each pairing a title + description column with a card of form controls (two columns on ≥lg, stacked below). Presentational and theme-driven — pass your own fields and submit handling.",
	category: "block",
	subcategory: "app",
	props: [
		{
			name: "groups",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ title: ReactNode; description?: ReactNode; children: ReactNode }>. Each group renders a heading/description column beside a card of form controls.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root wrapper." },
	],
	variants: [],
	slots: [
		{ name: "groups[].children", description: "Form controls for the group.", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted-foreground", "card", "card-foreground", "border"],
	examples: [
		{
			title: "Profile + notifications settings",
			description: "Two groups with form controls and a save button.",
			code: `import { AppSettings, Label, Input, Switch, Button } from "@hex-core/components";

<AppSettings
  groups={[
    {
      title: "Profile",
      description: "Update your account details.",
      children: (
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2"><Label htmlFor="name">Name</Label><Input id="name" defaultValue="Ada Lovelace" /></div>
          <Button type="submit" className="self-start">Save</Button>
        </form>
      ),
    },
    {
      title: "Notifications",
      description: "Choose what we email you about.",
      children: <label className="flex items-center gap-3 text-sm"><Switch defaultChecked /> Product updates</label>,
    },
  ]}
/>`,
			composition: ["app", "settings", "form", "dashboard"],
		},
	],
	ai: {
		whenToUse:
			"Use for account / workspace settings pages. Each group is one topic (Profile, Notifications, Billing). Put Label + control pairs in children and own the form submission.",
		whenNotToUse:
			"Don't use for a single field (just render the field). Don't use for a multi-step wizard (use the stepper). Don't put navigation here — that's the sidebar.",
		commonMistakes: [
			"Pairing inputs without <Label htmlFor> — the block lays out fields but doesn't wire labels for you.",
			"One giant group with every setting — split by topic so each card stays scannable.",
			"Wiring submit inside the block — submission lives in the form you pass as children.",
		],
		relatedComponents: ["form", "input", "label", "switch", "button", "app-shell"],
		accessibilityNotes:
			"Each group title is an <h3>. The block is layout only — accessible names depend on the Label/control pairing in the children you supply. Group description sits adjacent to the controls for context.",
		tokenBudget: 747,
	},
	tags: ["block", "app", "settings", "form", "dashboard"],
};
