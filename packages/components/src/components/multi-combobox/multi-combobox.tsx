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

interface MultiComboboxOption {
	/** The value returned in the onChange array (stable, unique). */
	value: string;
	/** The display label shown in the list and the trigger. */
	label: string;
	/** Mark as non-selectable. */
	disabled?: boolean;
}

interface MultiComboboxProps {
	/** The list of selectable options. */
	options: MultiComboboxOption[];
	/** Controlled selected values. */
	value?: string[];
	/** Fired when the user toggles an option: (values: string[]) => void */
	onChange?: (values: string[]) => void;
	/** Text shown on the trigger when nothing is selected. */
	placeholder?: string;
	/** Input placeholder inside the popover list. */
	searchPlaceholder?: string;
	/** Text shown when no options match the search. */
	emptyText?: string;
	/** Soft cap on selections. Once reached, unselected options become non-selectable. */
	maxSelected?: number;
	/** Close the popover after every pick. Default false (multi-select UX expects staying open). */
	closeOnSelect?: boolean;
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
 * Searchable multi-select input built on Command + Popover.
 *
 * Pass `options` with `{ value, label }` and bind `value` (string[]) +
 * `onChange`. The trigger shows "{n} selected" once any option is picked, with
 * the comma-separated label list mirrored into the `title` attribute for
 * pointer/screen-reader fallback. Each option is announced with `aria-selected`.
 * @returns A trigger button that opens a multi-select option list.
 */
function MultiCombobox({
	options,
	value,
	onChange,
	placeholder = "Select…",
	searchPlaceholder = "Search…",
	emptyText = "No results found.",
	maxSelected,
	closeOnSelect = false,
	disabled,
	className,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
}: MultiComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const listboxId = React.useId();
	const selected = React.useMemo(() => new Set(value ?? []), [value]);
	const selectedLabels = React.useMemo(
		() => options.filter((o) => selected.has(o.value)).map((o) => o.label),
		[options, selected],
	);
	const triggerLabel =
		selected.size === 0 ? placeholder : `${selected.size} selected`;
	const capReached =
		typeof maxSelected === "number" && selected.size >= maxSelected;

	const toggle = React.useCallback(
		(optionValue: string) => {
			const next = new Set(selected);
			if (next.has(optionValue)) {
				next.delete(optionValue);
			} else {
				if (capReached) return;
				next.add(optionValue);
			}
			onChange?.(Array.from(next));
			if (closeOnSelect) setOpen(false);
		},
		[selected, capReached, onChange, closeOnSelect],
	);

	return (
		<>
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
						title={selectedLabels.length > 0 ? selectedLabels.join(", ") : undefined}
						disabled={disabled}
						className={cn(
							"inline-flex h-[var(--control-height-md,2.5rem)] w-[240px] items-center justify-between gap-[var(--gap-sm,0.5rem)] rounded-md border border-input bg-background px-[var(--space-3,0.75rem)] py-[var(--space-2,0.5rem)] text-sm font-normal transition-all duration-[var(--duration-normal,200ms)] ease-out",
							"hover:bg-accent hover:text-accent-foreground",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							"disabled:pointer-events-none disabled:opacity-50",
							selected.size === 0 && "text-muted-foreground",
							className,
						)}
					>
						<span className="truncate">{triggerLabel}</span>
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
								{options.map((option) => {
									const isSelected = selected.has(option.value);
									const isCapped = !isSelected && capReached;
									const itemDisabled = option.disabled || isCapped;
									return (
										<CommandItem
											key={option.value}
											value={option.label}
											aria-selected={isSelected}
											aria-disabled={itemDisabled || undefined}
											disabled={itemDisabled}
											onSelect={() => {
												if (itemDisabled) return;
												toggle(option.value);
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
													isSelected ? "opacity-100" : "opacity-0",
												)}
												aria-hidden="true"
											>
												<polyline points="20 6 9 17 4 12" />
											</svg>
											{option.label}
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{/*
			 * Live region lives outside the trigger so its text is NOT pulled
			 * into the button's accessible name (sr-only spans inside a button
			 * concatenate via the AccName algorithm). Polite announcements fire
			 * only on selection-count changes.
			 */}
			<span className="sr-only" aria-live="polite">
				{selected.size === 0
					? "No items selected"
					: `${selected.size} item${selected.size === 1 ? "" : "s"} selected`}
			</span>
		</>
	);
}
MultiCombobox.displayName = "MultiCombobox";

export { MultiCombobox };
export type { MultiComboboxOption, MultiComboboxProps };
