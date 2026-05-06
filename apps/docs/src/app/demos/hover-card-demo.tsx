import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "../../components/ui";

/**
 * HoverCard patterns: user-profile preview (on a username button) and an
 * inline-link preview (on an anchor-styled Button).
 */
export function HoverCardDemo() {
	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					User profile preview
				</p>
				<HoverCard>
					<HoverCardTrigger asChild>
						<Button variant="link">@oscarabcorona</Button>
					</HoverCardTrigger>
					<HoverCardContent className="w-80">
						<div className="flex gap-4">
							<Avatar>
								<AvatarImage
									src="https://github.com/oscarabcorona.png"
									alt="@oscarabcorona"
									referrerPolicy="no-referrer"
								/>
								<AvatarFallback>OC</AvatarFallback>
							</Avatar>
							<div className="space-y-1">
								<h4 className="text-sm font-semibold">@oscarabcorona</h4>
								<p className="text-sm">Building Hex Core — an AI-native component library.</p>
								<div className="text-xs text-muted-foreground">Joined December 2021</div>
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Inline link preview
				</p>
				<p className="text-sm leading-relaxed">
					Hex Core is built on{" "}
					<HoverCard>
						<HoverCardTrigger asChild>
							<Button
								variant="link"
								className="h-auto p-0 align-baseline text-sm font-medium"
							>
								Radix Primitives
							</Button>
						</HoverCardTrigger>
						<HoverCardContent>
							<div className="space-y-1 text-sm">
								<p className="font-medium leading-none">Radix Primitives</p>
								<p className="text-muted-foreground">
									Unstyled, accessible components for building high-quality design
									systems and web apps in React.
								</p>
							</div>
						</HoverCardContent>
					</HoverCard>{" "}
					— the industry-standard headless primitives for React.
				</p>
			</div>
		</div>
	);
}
