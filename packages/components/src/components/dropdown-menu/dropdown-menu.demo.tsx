"use client";

import { useState } from "react";
import {
	Button,
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@hex-core/components";

/**
 * DropdownMenu patterns: account menu with shortcuts, a view-options menu
 * with checkbox items, and a sort-order menu with a radio group.
 */
export function DropdownMenuDemo() {
	const [bookmarksBar, setBookmarksBar] = useState(true);
	const [fullUrls, setFullUrls] = useState(false);
	const [sortBy, setSortBy] = useState("recent");

	return (
		<div className="flex flex-wrap items-start gap-3">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">Account</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>My account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						Profile
						<DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						Billing
						<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						Settings
						<DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						Log out
						<DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">View</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>Appearance</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuCheckboxItem
						checked={bookmarksBar}
						onCheckedChange={setBookmarksBar}
					>
						Bookmarks bar
						<DropdownMenuShortcut>⇧⌘B</DropdownMenuShortcut>
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked={fullUrls} onCheckedChange={setFullUrls}>
						Full URLs
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked disabled>
						Reload (always on)
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">Sort</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>Sort by</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
						<DropdownMenuRadioItem value="recent">Most recent</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
