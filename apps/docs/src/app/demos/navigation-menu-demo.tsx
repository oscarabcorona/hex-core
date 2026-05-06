"use client";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "../../components/ui";

/** NavigationMenu demo: Products mega-menu + About link. */
export function NavigationMenuDemo() {
	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Products</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[400px] gap-2 p-4">
							<li>
								<NavigationMenuLink
									href="/docs/getting-started"
									className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
								>
									<div className="text-sm font-medium leading-none">Getting Started</div>
									<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
										Install and configure Hex Core in your project.
									</p>
								</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink
									href="/docs/components/button"
									className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
								>
									<div className="text-sm font-medium leading-none">Components</div>
									<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
										Browse all available Hex Core components.
									</p>
								</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink
						className={navigationMenuTriggerStyle()}
						href="https://github.com/oscarabcorona/hex-core"
					>
						GitHub
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
