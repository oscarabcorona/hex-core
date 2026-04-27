import * as React from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../command/command.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover.js";
import { cn } from "../../lib/utils.js";

interface ComboboxOption {
	/** The value returned from onChange (stable, unique). */
	value: string;
	/** The display label shown in the list and the trigger. */
	label: string;
	/** Mark as non-selectable. */
	disabled?: boolean;
}

interface ComboboxProps {
	/** The list of selectable options. */
	options: ComboboxOption[];
	/** Controlled selected value. */
	value?: string;
	/** Fired when the user picks an option: (value: string) => void */
	onChange?: (value: string) => void;
	/** Text shown on the trigger when nothing is selected. */
	placeholder?: string;
	/** Input placeholder inside the popover list. */
	searchPlaceholder?: string;
	/** Text shown when no options match the search. */
	emptyText?: string;
	/** Disable the trigger. */
	disabled?: boolean;
	/** Extra class names on the trigger button. */
	className?: string;
	/** Accessible label for the trigger (required when no adjacent visible label). */
	"aria-label"?: string;
	/** Id of an external visible label that names this combobox. */
	"aria-labelledby"?: string;
}

/**
 * Searchable select input built on Command + Popover.
 *
 * Pass `options` with `{ value, label }` shape. The selected label is shown on
 * the trigger; the popover contains a CommandInput and filtered CommandList.
 * @returns A trigger button that opens a filtered option list.
 */
function Combobox({
	options,
	value,
	onChange,
	placeholder = "Select…",
	searchPlaceholder = "Search…",
	emptyText = "No results found.",
	disabled,
	className,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const listboxId = React.useId();
	const selected = options.find((o) => o.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					role="combobox"
					aria-expanded={open}
					aria-haspopup="listbox"
					/*
					 * Only reference the listbox id when the popover is open.
					 * The CommandList is portal-mounted by Radix Popover and
					 * does not exist in the DOM while closed; pointing at a
					 * missing id confuses some screen readers.
					 */
					aria-controls={open ? listboxId : undefined}
					aria-label={ariaLabel}
					aria-labelledby={ariaLabelledBy}
					disabled={disabled}
					className={cn(
						"inline-flex h-[var(--control-height-md,2.5rem)] w-[240px] items-center justify-between gap-[var(--gap-sm,0.5rem)] rounded-md border border-input bg-background px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)] text-sm font-normal transition-all duration-[var(--duration-normal,200ms)] ease-out",
						"hover:bg-accent hover:text-accent-foreground",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						"disabled:pointer-events-none disabled:opacity-50",
						!selected && "text-muted-foreground",
						className,
					)}
				>
					<span className="truncate">{selected ? selected.label : placeholder}</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-4 w-4 shrink-0 opacity-50"
						aria-hidden="true"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-[240px] p-0" align="start">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList id={listboxId}>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.label}
									disabled={option.disabled}
									onSelect={() => {
										onChange?.(option.value);
										setOpen(false);
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className={cn(
											"mr-[var(--space-2,0.5rem)] h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
										aria-hidden="true"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
Combobox.displayName = "Combobox";

export { Combobox };
export type { ComboboxOption, ComboboxProps };
