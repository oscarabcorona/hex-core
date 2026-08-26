import { Input, Label } from "@hex-core/components";

/**
 * Label paired with an Input in common form patterns: default, required, and disabled.
 * The disabled example shows how the label stays readable while the input is inert.
 */
export function LabelDemo() {
	return (
		<div className="grid w-full max-w-sm gap-5">
			<div className="grid gap-1.5">
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" placeholder="you@example.com" />
			</div>

			<div className="grid gap-1.5">
				<Label htmlFor="name">
					Name <span className="text-destructive">*</span>
				</Label>
				<Input id="name" placeholder="Your full name" required />
			</div>

			{/*
			 * Tailwind's `peer-disabled:` matches a preceding `.peer` sibling, so the
			 * Input must come BEFORE the Label. `flex-col-reverse` keeps the visual
			 * order (label on top) while preserving the DOM order needed by peer-*.
			 */}
			<div className="flex flex-col-reverse gap-1.5">
				<Input id="plan" defaultValue="Enterprise" disabled className="peer" />
				<Label htmlFor="plan">Plan</Label>
			</div>
		</div>
	);
}
