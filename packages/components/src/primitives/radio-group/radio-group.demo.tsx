import { Label, RadioGroup, RadioGroupItem } from "@hex-core/components";

/**
 * RadioGroup patterns: vertical (default), horizontal, with descriptions,
 * and disabled-item handling.
 */
export function RadioGroupDemo() {
	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Vertical</p>
				<RadioGroup defaultValue="comfortable">
					<div className="flex items-center gap-2">
						<RadioGroupItem value="default" id="rg-v1" />
						<Label htmlFor="rg-v1">Default</Label>
					</div>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="comfortable" id="rg-v2" />
						<Label htmlFor="rg-v2">Comfortable</Label>
					</div>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="compact" id="rg-v3" />
						<Label htmlFor="rg-v3">Compact</Label>
					</div>
				</RadioGroup>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Horizontal</p>
				<RadioGroup orientation="horizontal" defaultValue="sm">
					<div className="flex items-center gap-2">
						<RadioGroupItem value="sm" id="rg-h1" />
						<Label htmlFor="rg-h1">SM</Label>
					</div>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="md" id="rg-h2" />
						<Label htmlFor="rg-h2">MD</Label>
					</div>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="lg" id="rg-h3" />
						<Label htmlFor="rg-h3">LG</Label>
					</div>
				</RadioGroup>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With descriptions</p>
				<RadioGroup defaultValue="monthly" className="gap-3">
					<div className="flex items-start gap-2">
						<RadioGroupItem value="monthly" id="rg-d1" className="mt-0.5" />
						<div className="grid gap-0.5">
							<Label htmlFor="rg-d1">Monthly</Label>
							<p className="text-xs text-muted-foreground">
								$12 / month · cancel anytime.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<RadioGroupItem value="yearly" id="rg-d2" className="mt-0.5" />
						<div className="grid gap-0.5">
							<Label htmlFor="rg-d2">Yearly</Label>
							<p className="text-xs text-muted-foreground">
								$120 / year · save two months.
							</p>
						</div>
					</div>
				</RadioGroup>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With disabled option</p>
				<RadioGroup defaultValue="standard">
					<div className="flex items-center gap-2">
						<RadioGroupItem value="standard" id="rg-x1" />
						<Label htmlFor="rg-x1">Standard shipping</Label>
					</div>
					<div className="flex items-center gap-2">
						<RadioGroupItem value="express" id="rg-x2" disabled />
						<Label htmlFor="rg-x2" className="text-muted-foreground">
							Express (unavailable)
						</Label>
					</div>
				</RadioGroup>
			</div>
		</div>
	);
}
