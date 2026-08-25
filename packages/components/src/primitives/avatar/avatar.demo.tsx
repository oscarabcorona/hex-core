import { Avatar, AvatarFallback, AvatarImage } from "@hex-core/components";

/**
 * Avatar patterns: image + fallback, fallback-only (broken URL), size scale,
 * status dot, and a stacked user list.
 */
export function AvatarDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Image + fallback</p>
				<div className="flex items-center gap-3">
					<Avatar>
						<AvatarImage
							src="https://github.com/oscarabcorona.png"
							alt="@oscarabcorona"
							referrerPolicy="no-referrer"
						/>
						<AvatarFallback>OC</AvatarFallback>
					</Avatar>
					<Avatar>
						{/* Broken URL falls back to initials. */}
						<AvatarImage src="https://example.invalid/missing.jpg" alt="" />
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Sizes</p>
				<div className="flex items-end gap-3">
					<Avatar className="h-8 w-8">
						<AvatarFallback className="text-xs">SM</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarFallback>MD</AvatarFallback>
					</Avatar>
					<Avatar className="h-14 w-14">
						<AvatarFallback className="text-base">LG</AvatarFallback>
					</Avatar>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With status dot</p>
				<div className="relative inline-block">
					<Avatar>
						<AvatarImage
							src="https://github.com/oscarabcorona.png"
							alt="@oscarabcorona"
							referrerPolicy="no-referrer"
						/>
						<AvatarFallback>OC</AvatarFallback>
					</Avatar>
					{/* Consumers typically map the dot color to their own status palette. */}
					<span
						aria-hidden="true"
						className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-primary"
					/>
					<span className="sr-only">Online</span>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Stacked</p>
				<div className="flex -space-x-2">
					<Avatar className="border-2 border-background">
						<AvatarImage src="https://github.com/oscarabcorona.png" alt="" />
						<AvatarFallback>OC</AvatarFallback>
					</Avatar>
					<Avatar className="border-2 border-background">
						<AvatarFallback>AB</AvatarFallback>
					</Avatar>
					<Avatar className="border-2 border-background">
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>
					<Avatar className="border-2 border-background">
						<AvatarFallback className="bg-muted text-xs">+4</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</div>
	);
}
