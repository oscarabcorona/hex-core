import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const tabsSchema: ComponentSchemaDefinition = {
	name: "tabs",
	displayName: "Tabs",
	description: "A tabbed interface with accessible keyboard navigation. Built on Radix UI Tabs.",
	category: "component",
	subcategory: "navigation",
	props: [
		{ name: "defaultValue", type: "string", required: false, description: "Default active tab value (uncontrolled)" },
		{ name: "value", type: "string", required: false, description: "Controlled active tab value" },
		{ name: "onValueChange", type: "function", required: false, description: "Callback: (value: string) => void" },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [],
	slots: [
		{ name: "children", description: "TabsList + TabsContent elements", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@radix-ui/react-tabs", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "muted-foreground", "background", "foreground", "ring"],
	examples: [
		{
			title: "Basic tabs",
			description: "Two-tab interface",
			code: '<Tabs defaultValue="account">\n  <TabsList>\n    <TabsTrigger value="account">Account</TabsTrigger>\n    <TabsTrigger value="password">Password</TabsTrigger>\n  </TabsList>\n  <TabsContent value="account">Account settings here.</TabsContent>\n  <TabsContent value="password">Password settings here.</TabsContent>\n</Tabs>',
		},
	],
	ai: {
		whenToUse: "Use to organize content into switchable panels: settings pages, dashboards, product details with multiple sections.",
		whenNotToUse: "Don't use for navigation between pages (use router/links). Don't use for steppers/wizards (use a stepper component).",
		commonMistakes: ["Missing defaultValue causing no tab selected initially", "TabsTrigger value not matching TabsContent value", "Using for page navigation instead of in-page content switching"],
		relatedComponents: ["card", "separator"],
		accessibilityNotes: "Full keyboard navigation built-in (arrow keys, Home, End). Radix handles aria-selected, role='tabpanel', etc.",
		tokenBudget: 529,
	},
	tags: ["tabs", "navigation", "panel", "tabbed", "sections"],
};
