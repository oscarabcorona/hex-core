import { Badge, Button } from "@hex-core/components";

/**
 * Badge variants and common contextual usage (status next to a heading,
 * count indicator next to a button).
 */
export function BadgeDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Variants</p>
				<div className="flex flex-wrap items-center gap-2">
					<Badge>Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="destructive">Error</Badge>
					<Badge variant="outline">Outline</Badge>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Next to a heading</p>
				<div className="flex items-center gap-2">
					<h3 className="text-lg font-semibold">API Keys</h3>
					<Badge variant="secondary">Beta</Badge>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Count indicator</p>
				<Button variant="outline">
					Inbox <Badge className="ml-1">12</Badge>
				</Button>
			</div>
		</div>
	);
}
