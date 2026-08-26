import { AspectRatio } from "@hex-core/components";

const ratios: Array<{ label: string; ratio: number }> = [
	{ label: "16 : 9", ratio: 16 / 9 },
	{ label: "1 : 1", ratio: 1 },
	{ label: "2 : 3", ratio: 2 / 3 },
];

/** AspectRatio demo: three common ratios shown side-by-side. */
export function AspectRatioDemo() {
	return (
		<div className="grid w-full max-w-md grid-cols-3 gap-3">
			{ratios.map(({ label, ratio }) => (
				<AspectRatio key={label} ratio={ratio} className="overflow-hidden rounded-md bg-muted">
					<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-muted text-xs font-medium text-muted-foreground">
						{label}
					</div>
				</AspectRatio>
			))}
		</div>
	);
}
