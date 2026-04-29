import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const cardSchema: ComponentSchemaDefinition = {
	name: "card",
	displayName: "Card",
	description: "A container component with header, content, and footer sections. Includes subtle shadow and hover effects.",
	category: "component",
	subcategory: "layout",
	props: [
		{ name: "className", type: "string", required: false, description: "Additional CSS classes on the root card" },
	],
	variants: [],
	slots: [
		{ name: "children", description: "Card content — use CardHeader, CardContent, CardFooter subcomponents", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "card-foreground", "border", "muted-foreground"],
	examples: [
		{
			title: "Complete card",
			description: "Card with header, content, and footer",
			code: '<Card>\n  <CardHeader>\n    <CardTitle>Create project</CardTitle>\n    <CardDescription>Deploy your new project in one-click.</CardDescription>\n  </CardHeader>\n  <CardContent>\n    <p>Card content here</p>\n  </CardContent>\n  <CardFooter>\n    <Button>Deploy</Button>\n  </CardFooter>\n</Card>',
			composition: ["showcase", "settings"],
		},
		{
			title: "Stat card",
			description: "Single-metric dashboard card — title + large number + trend",
			code: '<Card>\n  <CardHeader className="pb-2">\n    <CardDescription>Total revenue</CardDescription>\n    <CardTitle className="text-3xl tabular-nums">$45,231.89</CardTitle>\n  </CardHeader>\n  <CardContent>\n    <p className="text-xs text-muted-foreground">+20.1% from last month</p>\n  </CardContent>\n</Card>',
			composition: ["dashboard", "stat", "metric"],
		},
		{
			title: "Form section card",
			description: "Card framing a form section, with submit pinned to the footer",
			code: '<Card>\n  <CardHeader>\n    <CardTitle>Profile</CardTitle>\n    <CardDescription>Update your account details.</CardDescription>\n  </CardHeader>\n  <CardContent className="space-y-4">\n    <Input placeholder="Display name" />\n    <Input type="email" placeholder="Email" />\n  </CardContent>\n  <CardFooter className="justify-end gap-2">\n    <Button variant="secondary">Cancel</Button>\n    <Button type="submit">Save</Button>\n  </CardFooter>\n</Card>',
			composition: ["form", "settings", "form-action"],
		},
	],
	ai: {
		whenToUse:
			"Use to group related content with a visual boundary: settings panels, product listings, dashboard widgets, form sections, content previews. Each card should feel like one self-contained unit.",
		whenNotToUse:
			"Don't use for full-page layouts (use plain divs). Don't use a card to hold one tiny thing (use a Badge or inline content). Don't use a card as a button — use Button with asChild.",
		commonMistakes: [
			"Nesting cards",
			"Using Card when a simple div with border would suffice",
			"Forgetting CardContent padding when placing forms inside",
		],
		antiPatterns: [
			{
				mistake: "Nesting <Card> inside <Card> to group sub-sections",
				insteadUse: "separator",
				why: "Two raised surfaces inside each other muddles the elevation model — readers can't tell which container 'owns' an action. Use Separator + extra padding within a single Card to visually divide sections, or split into sibling Cards.",
			},
			{
				mistake: "Putting an entire Card inside a <button> or <a> to make it clickable",
				insteadUse: "button",
				why: "Browsers don't fully support nested interactive content; screen readers announce the full card text every focus. Use <Card asChild><a>...</a></Card> patterns or move just the action inside CardFooter.",
			},
			{
				mistake: "Using Card for a top-bar / app-shell wrapper",
				insteadUse: "container",
				why: "Card adds elevation chrome that fights with the chrome of the app shell. Use Container for layout boundaries and reserve Card for the content INSIDE the layout.",
			},
		],
		relatedComponents: ["button", "separator", "container", "stack"],
		accessibilityNotes:
			"Card is a div by default. Add role='region' and aria-labelledby (pointing to CardTitle's id) for landmark cards. CardTitle renders h3 — ensure heading hierarchy is correct on the page.",
		tokenBudget: 400,
	},
	tags: ["card", "container", "panel", "layout", "surface"],
};
