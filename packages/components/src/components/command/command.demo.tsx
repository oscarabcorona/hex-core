"use client";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@hex-core/components";

/** Command demo: inline palette with two groups, a separator, and shortcut hints. */
export function CommandDemo() {
	return (
		<Command className="w-[380px] rounded-lg border shadow-md">
			<CommandInput placeholder="Type a command or search…" />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem>Calendar</CommandItem>
					<CommandItem>Search emoji</CommandItem>
					<CommandItem>Calculator</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem>
						Profile
						<CommandShortcut>⌘P</CommandShortcut>
					</CommandItem>
					<CommandItem>
						Billing
						<CommandShortcut>⌘B</CommandShortcut>
					</CommandItem>
					<CommandItem>
						Settings
						<CommandShortcut>⌘S</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
