import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const navigationMenuSchema: ComponentSchemaDefinition = {
	name: "navigation-menu",
	displayName: "Navigation Menu",
	description: "Website-style mega-menu with hover-triggered content panels. Used for marketing/site navigation headers.",
	category: "component",
	subcategory: "navigation",
	props: [
		{ name: "value", type: "string", required: false, description: "Controlled active menu value" },
		{ name: "onValueChange", type: "function", required: false, description: "Callback when active menu changes" },
		{ name: "delayDuration", type: "number", required: false, default: 200, description: "Delay before opening a menu on hover (ms)" },
		{ name: "orientation", type: "enum", required: false, default: "horizontal", description: "Layout direction", enumValues: ["horizontal", "vertical"] },
	],
	variants: [],
	slots: [
		{ name: "children", description: "NavigationMenuList containing NavigationMenuItem elements", required: true, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["@radix-ui/react-navigation-menu", "class-variance-authority", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "accent", "accent-foreground", "popover", "popover-foreground", "border"],
	examples: [
		{
			title: "Simple nav",
			description: "Top-level link + mega-menu trigger",
			code: '<NavigationMenu>\n  <NavigationMenuList>\n    <NavigationMenuItem>\n      <NavigationMenuTrigger>Products</NavigationMenuTrigger>\n      <NavigationMenuContent>\n        <ul className="grid w-[400px] gap-3 p-4">\n          <li><NavigationMenuLink href="/docs">Docs</NavigationMenuLink></li>\n          <li><NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink></li>\n        </ul>\n      </NavigationMenuContent>\n    </NavigationMenuItem>\n    <NavigationMenuItem>\n      <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/about">About</NavigationMenuLink>\n    </NavigationMenuItem>\n  </NavigationMenuList>\n</NavigationMenu>',
		},
	],
	ai: {
		whenToUse:
			"Use for marketing-site top nav with grouped links and mega-menus: Products, Resources, Pricing flyouts. Desktop-first but keyboard accessible.",
		whenNotToUse:
			"Don't use for app shell menus (use Menubar). Don't use for single dropdowns (use DropdownMenu). On mobile, pair with a separate hamburger/Drawer pattern — NavigationMenu collapses poorly on small screens.",
		commonMistakes: [
			"Mixing regular <a> with NavigationMenuLink — must use NavigationMenuLink for keyboard/roving focus",
			"Forgetting the viewport — handled automatically when using the composed NavigationMenu root",
			"Too many top-level items overflow on mobile",
		],
		relatedComponents: ["menubar", "dropdown-menu"],
		accessibilityNotes:
			"Radix implements the WAI-ARIA menu-button pattern with hover-intent delays and focus trapping in content. Links inside NavigationMenuLink get roving tabindex.",
		tokenBudget: 698,
	},
	tags: ["navigation-menu", "mega-menu", "nav", "header", "site"],
};
