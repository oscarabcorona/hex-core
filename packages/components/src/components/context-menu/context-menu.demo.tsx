"use client";

import { useState } from "react";
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuTrigger,
} from "@hex-core/components";

/**
 * ContextMenu demo: right-click a canvas region to reveal a browser-style
 * menu with items, shortcuts, checkbox options, and a radio group.
 */
export function ContextMenuDemo() {
	const [bookmarks, setBookmarks] = useState(true);
	const [fullUrls, setFullUrls] = useState(false);
	const [person, setPerson] = useState("pedro");

	return (
		<ContextMenu>
			<ContextMenuTrigger className="flex h-40 w-full max-w-sm items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
				Right-click (or long-press) here
			</ContextMenuTrigger>
			<ContextMenuContent className="w-64">
				<ContextMenuItem inset>
					Back
					<ContextMenuShortcut>⌘[</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem inset disabled>
					Forward
					<ContextMenuShortcut>⌘]</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem inset>
					Reload
					<ContextMenuShortcut>⌘R</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
					Show bookmarks bar
					<ContextMenuShortcut>⇧⌘B</ContextMenuShortcut>
				</ContextMenuCheckboxItem>
				<ContextMenuCheckboxItem checked={fullUrls} onCheckedChange={setFullUrls}>
					Show full URLs
				</ContextMenuCheckboxItem>
				<ContextMenuSeparator />
				<ContextMenuLabel inset>People</ContextMenuLabel>
				<ContextMenuRadioGroup value={person} onValueChange={setPerson}>
					<ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
					<ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
				</ContextMenuRadioGroup>
			</ContextMenuContent>
		</ContextMenu>
	);
}
