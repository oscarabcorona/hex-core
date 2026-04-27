import {
	Label,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "../../components/ui";

/**
 * Select patterns: with label, grouped options with separator, disabled item,
 * and disabled entire select.
 */
export function SelectDemo() {
	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With label</p>
				<div className="grid gap-1.5">
					<Label htmlFor="fruit">Fruit</Label>
					<Select>
						<SelectTrigger id="fruit" className="w-[200px]">
							<SelectValue placeholder="Select a fruit" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="apple">Apple</SelectItem>
							<SelectItem value="banana">Banana</SelectItem>
							<SelectItem value="blueberry">Blueberry</SelectItem>
							<SelectItem value="grapes">Grapes</SelectItem>
							<SelectItem value="pineapple">Pineapple</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Grouped options (with separator)
				</p>
				<Select>
					<SelectTrigger className="w-[240px]" aria-label="Timezone">
						<SelectValue placeholder="Select a timezone" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>North America</SelectLabel>
							<SelectItem value="est">Eastern (EST)</SelectItem>
							<SelectItem value="cst">Central (CST)</SelectItem>
							<SelectItem value="pst">Pacific (PST)</SelectItem>
						</SelectGroup>
						<SelectSeparator />
						<SelectGroup>
							<SelectLabel>Europe</SelectLabel>
							<SelectItem value="gmt">London (GMT)</SelectItem>
							<SelectItem value="cet">Berlin (CET)</SelectItem>
							<SelectItem value="eet">Helsinki (EET)</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With disabled option</p>
				<Select>
					<SelectTrigger className="w-[200px]" aria-label="Plan">
						<SelectValue placeholder="Pick a plan" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="free">Free</SelectItem>
						<SelectItem value="pro">Pro</SelectItem>
						<SelectItem value="team" disabled>
							Team (contact sales)
						</SelectItem>
						<SelectItem value="enterprise" disabled>
							Enterprise (sold out)
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
				<Select disabled>
					<SelectTrigger className="w-[200px]" aria-label="Disabled option">
						<SelectValue placeholder="Unavailable" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="placeholder">Option</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
