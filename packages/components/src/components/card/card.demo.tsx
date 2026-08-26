import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hex-core/components";

/**
 * Card patterns: full (header/content/footer), minimal metric, and a
 * user profile card composing Avatar + Badge.
 */
export function CardDemo() {
	return (
		<div className="grid w-full max-w-2xl gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Full (header · content · footer)
				</p>
				<Card className="w-full max-w-sm">
					<CardHeader>
						<CardTitle>Create project</CardTitle>
						<CardDescription>Deploy your new project in one click.</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm">
							Configure your project settings and deploy instantly.
						</p>
					</CardContent>
					<CardFooter>
						<Button>Deploy</Button>
					</CardFooter>
				</Card>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Metric</p>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
					<Card>
						<CardHeader>
							<CardDescription>Total revenue</CardDescription>
							<CardTitle className="text-3xl">$45,231.89</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">+20.1% from last month</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardDescription>Subscribers</CardDescription>
							<CardTitle className="text-3xl">+2,350</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">+180 this week</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardDescription>Active now</CardDescription>
							<CardTitle className="text-3xl">573</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">+12 since last hour</p>
						</CardContent>
					</Card>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					User card (Avatar + Badge)
				</p>
				<Card className="w-full max-w-sm">
					<CardHeader className="flex flex-row items-center gap-4 space-y-0">
						<Avatar>
							<AvatarImage
								src="https://github.com/oscarabcorona.png"
								alt="@oscarabcorona"
								referrerPolicy="no-referrer"
							/>
							<AvatarFallback>OC</AvatarFallback>
						</Avatar>
						<div className="flex-1 space-y-1">
							<div className="flex items-center gap-2">
								<CardTitle className="text-base">Oscar Corona</CardTitle>
								<Badge variant="secondary">Pro</Badge>
							</div>
							<CardDescription>Staff engineer · Remote</CardDescription>
						</div>
					</CardHeader>
					<CardFooter className="gap-2">
						<Button size="sm">Follow</Button>
						<Button size="sm" variant="outline">Message</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
