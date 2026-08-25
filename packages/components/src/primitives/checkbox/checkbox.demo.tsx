"use client";

import * as React from "react";
import { Checkbox, Label } from "@hex-core/components";

/**
 * Checkbox patterns: basic with label, with helper text, multi-select list,
 * indeterminate parent-of-children pattern, and disabled.
 */
export function CheckboxDemo() {
	const [accept, setAccept] = React.useState(false);

	// Parent + children pattern: parent is indeterminate when some (not all) children are checked.
	const [items, setItems] = React.useState({ email: true, push: false, sms: false });
	const checkedCount = Object.values(items).filter(Boolean).length;
	const parentState: boolean | "indeterminate" =
		checkedCount === 0 ? false : checkedCount === 3 ? true : "indeterminate";

	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Basic</p>
				<div className="flex items-center gap-2">
					<Checkbox
						id="terms"
						checked={accept}
						onCheckedChange={(v) => setAccept(v === true)}
					/>
					<Label htmlFor="terms">Accept terms and conditions</Label>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With description</p>
				<div className="flex items-start gap-2">
					<Checkbox id="marketing" defaultChecked className="mt-0.5" />
					<div className="grid gap-1 leading-none">
						<Label htmlFor="marketing">Send me product updates</Label>
						<p className="text-xs text-muted-foreground">
							You can unsubscribe any time from the account settings.
						</p>
					</div>
				</div>
			</div>

			<div>
				<p
					id="notify-all-hint"
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					Indeterminate (parent reflects partial selection)
				</p>
				<div className="grid gap-2">
					<div className="flex items-center gap-2">
						<Checkbox
							id="notify-all"
							checked={parentState}
							aria-describedby="notify-all-hint"
							onCheckedChange={(v) => {
								const next = v === true;
								setItems({ email: next, push: next, sms: next });
							}}
						/>
						<Label htmlFor="notify-all">Notifications</Label>
					</div>
					<div className="ml-6 grid gap-2">
						{(Object.keys(items) as Array<keyof typeof items>).map((key) => (
							<div key={key} className="flex items-center gap-2">
								<Checkbox
									id={`notify-${key}`}
									checked={items[key]}
									onCheckedChange={(v) =>
										setItems((prev) => ({ ...prev, [key]: v === true }))
									}
								/>
								<Label htmlFor={`notify-${key}`} className="capitalize">
									{key}
								</Label>
							</div>
						))}
					</div>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
				<div className="grid gap-2">
					<div className="flex items-center gap-2">
						<Checkbox id="disabled-unchecked" disabled />
						<Label htmlFor="disabled-unchecked" className="text-muted-foreground">
							Disabled — unchecked
						</Label>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox id="disabled-checked" disabled defaultChecked />
						<Label htmlFor="disabled-checked" className="text-muted-foreground">
							Disabled — checked
						</Label>
					</div>
				</div>
			</div>
		</div>
	);
}
