import { ScrollArea, Separator } from "@hex-core/components";

const tags = Array.from({ length: 50 }).map((_, i) => `v1.2.0-beta.${50 - i}`);

const artists = [
	"Ornella Binni",
	"Tom Byrom",
	"Vladimir Malyavko",
	"Yuki Aoki",
	"Dmitri Kolpakov",
	"Bruno Martins",
];

/**
 * ScrollArea patterns: vertical list of tags, and a horizontal gallery
 * of theme-tinted cards with a horizontal scrollbar.
 */
export function ScrollAreaDemo() {
	return (
		<div className="grid w-full gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Vertical</p>
				<ScrollArea className="h-72 w-48 rounded-md border">
					<div className="p-4">
						<h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
						{tags.map((tag) => (
							<div key={tag} className="text-sm">
								{tag}
								<Separator className="my-2" />
							</div>
						))}
					</div>
				</ScrollArea>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Horizontal</p>
				<ScrollArea
					type="always"
					aria-label="Photo gallery"
					className="w-96 whitespace-nowrap rounded-md border"
				>
					<div className="flex w-max space-x-4 p-4">
						{artists.map((artist) => (
							<figure key={artist} className="shrink-0">
								<div
									aria-hidden="true"
									className="h-40 w-40 rounded-md bg-gradient-to-br from-primary/30 to-muted"
								/>
								<figcaption className="pt-2 text-xs text-muted-foreground">
									Photo by <span className="font-medium text-foreground">{artist}</span>
								</figcaption>
							</figure>
						))}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
