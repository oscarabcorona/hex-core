"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarProvider,
	SidebarTrigger,
} from "@hex-core/components";

/**
 * Sidebar demo: collapsible app-shell with icon+label nav items and a
 * user footer composing Avatar. Toggle via the button in the main area.
 */
export function SidebarDemo() {
	const nav = [
		{
			href: "dashboard",
			label: "Dashboard",
			active: true,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<rect x="3" y="3" width="7" height="9" />
					<rect x="14" y="3" width="7" height="5" />
					<rect x="14" y="12" width="7" height="9" />
					<rect x="3" y="16" width="7" height="5" />
				</svg>
			),
		},
		{
			href: "projects",
			label: "Projects",
			active: false,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
				</svg>
			),
		},
		{
			href: "settings",
			label: "Settings",
			active: false,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-4 w-4"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="3" />
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
				</svg>
			),
		},
	];

	return (
		<div className="h-[360px] overflow-hidden rounded-lg border">
			<SidebarProvider className="min-h-0 h-full">
				<Sidebar>
					<SidebarHeader>
						<span className="font-semibold">Acme</span>
					</SidebarHeader>
					<SidebarContent className="gap-1">
						{nav.map((item) => (
							<SidebarItem key={item.href} active={item.active}>
								{item.icon}
								{item.label}
							</SidebarItem>
						))}
					</SidebarContent>
					<SidebarFooter>
						<div className="flex items-center gap-2">
							<Avatar className="h-8 w-8">
								<AvatarImage
									src="https://github.com/oscarabcorona.png"
									alt="@oscarabcorona"
									referrerPolicy="no-referrer"
								/>
								<AvatarFallback className="text-xs">OC</AvatarFallback>
							</Avatar>
							<div className="grid text-xs leading-tight">
								<span className="font-medium">Oscar Corona</span>
								<span className="text-muted-foreground">oscar@hex-core.dev</span>
							</div>
						</div>
					</SidebarFooter>
				</Sidebar>
				<main className="flex flex-1 flex-col gap-3 p-4">
					<div className="flex items-center gap-2">
						<SidebarTrigger />
						<span className="text-sm font-medium">Toggle the sidebar</span>
					</div>
					<p className="text-sm text-muted-foreground">
						Click the toggle to collapse or expand the sidebar.
					</p>
				</main>
			</SidebarProvider>
		</div>
	);
}
