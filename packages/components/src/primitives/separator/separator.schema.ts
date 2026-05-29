import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const separatorSchema: ComponentSchemaDefinition = {
	name: "separator",
	displayName: "Separator",
	description: "A visual divider between content sections with horizontal or vertical orientation.",
	category: "primitive",
	subcategory: "layout",
	props: [
		{ name: "orientation", type: "enum", required: false, default: "horizontal", description: "Direction of the separator", enumValues: ["horizontal", "vertical"] },
		{ name: "decorative", type: "boolean", required: false, default: true, description: "If true, separator is purely visual and hidden from screen readers" },
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-separator", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["border"],
	examples: [
		{ title: "Horizontal", description: "Default horizontal divider", code: "<Separator />" },
		{ title: "Vertical", description: "Vertical divider in a flex row", code: '<div className="flex h-5 items-center gap-4">\n  <span>Left</span>\n  <Separator orientation="vertical" />\n  <span>Right</span>\n</div>' },
	],
	ai: {
		whenToUse: "Use to visually separate content sections, menu items, or sidebar groups.",
		whenNotToUse: "Don't use for spacing (use margin/padding). Don't use between every list item.",
		commonMistakes: ["Using as spacing instead of semantic separation", "Forgetting orientation='vertical' needs parent height"],
		relatedComponents: ["card", "breadcrumb", "dropdown-menu", "menubar"],
		accessibilityNotes: "Set decorative=false if the separator conveys semantic meaning. Radix handles role='separator'.",
		tokenBudget: 443,
	},
	tags: ["separator", "divider", "hr", "layout"],
};
