import { ToggleGroup, ToggleGroupItem } from "@hex-core/components";

/**
 * ToggleGroup patterns: single-select (text alignment), multi-select
 * (formatting marks), and size scale via group-level size prop.
 */
export function ToggleGroupDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Single-select (text alignment)
				</p>
				<ToggleGroup type="single" defaultValue="left" variant="outline">
					<ToggleGroupItem value="left" aria-label="Left align">
						L
					</ToggleGroupItem>
					<ToggleGroupItem value="center" aria-label="Center align">
						C
					</ToggleGroupItem>
					<ToggleGroupItem value="right" aria-label="Right align">
						R
					</ToggleGroupItem>
					<ToggleGroupItem value="justify" aria-label="Justify">
						J
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Multi-select (formatting marks)
				</p>
				<ToggleGroup type="multiple" defaultValue={["bold"]}>
					<ToggleGroupItem value="bold" aria-label="Bold">
						<span className="font-bold">B</span>
					</ToggleGroupItem>
					<ToggleGroupItem value="italic" aria-label="Italic">
						<span className="italic">I</span>
					</ToggleGroupItem>
					<ToggleGroupItem value="underline" aria-label="Underline">
						<span className="underline">U</span>
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Sizes</p>
				<div className="flex flex-wrap items-center gap-3">
					<ToggleGroup type="single" size="sm" variant="outline" defaultValue="a">
						<ToggleGroupItem value="a" aria-label="A">A</ToggleGroupItem>
						<ToggleGroupItem value="b" aria-label="B">B</ToggleGroupItem>
					</ToggleGroup>
					<ToggleGroup type="single" variant="outline" defaultValue="a">
						<ToggleGroupItem value="a" aria-label="A">A</ToggleGroupItem>
						<ToggleGroupItem value="b" aria-label="B">B</ToggleGroupItem>
					</ToggleGroup>
					<ToggleGroup type="single" size="lg" variant="outline" defaultValue="a">
						<ToggleGroupItem value="a" aria-label="A">A</ToggleGroupItem>
						<ToggleGroupItem value="b" aria-label="B">B</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</div>
		</div>
	);
}
