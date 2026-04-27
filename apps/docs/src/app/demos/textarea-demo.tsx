import { Label, Textarea } from "../../components/ui";

/**
 * Textarea patterns: basic, with label, error state with aria-invalid,
 * character-count helper, and disabled.
 */
export function TextareaDemo() {
	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Basic</p>
				<Textarea
					placeholder="Write your message…"
					aria-label="Basic message"
				/>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With label</p>
				<div className="grid gap-1.5">
					<Label htmlFor="message">Message</Label>
					<Textarea id="message" placeholder="Type your message here." rows={4} />
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With character count</p>
				<div className="grid gap-1.5">
					<Label htmlFor="bio">Bio</Label>
					<Textarea
						id="bio"
						placeholder="Short biography"
						maxLength={160}
						aria-describedby="bio-hint"
					/>
					<p id="bio-hint" className="text-xs text-muted-foreground">
						Up to 160 characters.
					</p>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Error state</p>
				<div className="grid gap-1.5">
					<Label htmlFor="feedback">Feedback</Label>
					<Textarea
						id="feedback"
						defaultValue=""
						aria-invalid="true"
						aria-describedby="feedback-err"
						className="border-destructive focus-visible:ring-destructive"
					/>
					<p id="feedback-err" className="text-xs text-destructive">
						Feedback is required.
					</p>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
				<Textarea
					defaultValue="Read-only content."
					disabled
					aria-label="Disabled textarea"
				/>
			</div>
		</div>
	);
}
