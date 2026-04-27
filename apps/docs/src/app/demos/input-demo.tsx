import { Input, Label } from "../../components/ui";

/**
 * Input patterns: types (text, email, password, number, search, file),
 * with-label composition, and error state.
 */
export function InputDemo() {
	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Types</p>
				<div className="grid gap-2">
					<Input placeholder="Default text" aria-label="Default text input" />
					<Input
						type="email"
						placeholder="you@example.com"
						aria-label="Email"
					/>
					<Input
						type="password"
						placeholder="Password"
						aria-label="Password"
					/>
					<Input
						type="number"
						placeholder="42"
						min={0}
						max={100}
						aria-label="Number between 0 and 100"
					/>
					<Input type="search" placeholder="Search…" aria-label="Search" />
				</div>
			</div>

			<div>
				<Label
					htmlFor="input-demo-file"
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					File upload
				</Label>
				<Input id="input-demo-file" type="file" />
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With label</p>
				<div className="grid gap-1.5">
					<Label htmlFor="username">Username</Label>
					<Input id="username" placeholder="jane.doe" />
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Error state</p>
				<div className="grid gap-1.5">
					<Label htmlFor="email-error">Email</Label>
					<Input
						id="email-error"
						type="email"
						defaultValue="not-an-email"
						aria-invalid="true"
						aria-describedby="email-error-msg"
						className="border-destructive focus-visible:ring-destructive"
					/>
					<p id="email-error-msg" className="text-xs text-destructive">
						Please enter a valid email address.
					</p>
				</div>
			</div>

			<div>
				<Label
					htmlFor="input-demo-disabled"
					className="mb-2 text-xs font-medium text-muted-foreground"
				>
					Disabled
				</Label>
				<Input id="input-demo-disabled" defaultValue="Read-only value" disabled />
			</div>
		</div>
	);
}
