import { Toggle } from "@hex-core/components";

/** Toggle demo: variants, sizes, icon-only, with-text, and disabled. */
export function ToggleDemo() {
	return (
		<div className="flex w-full max-w-md flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Variants</p>
				<div className="flex flex-wrap items-center gap-2">
					<Toggle aria-label="Toggle bold">
						<span className="font-bold">B</span>
					</Toggle>
					<Toggle aria-label="Toggle italic" variant="outline">
						<span className="italic">I</span>
					</Toggle>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Sizes</p>
				<div className="flex flex-wrap items-center gap-2">
					<Toggle aria-label="Small" size="sm">
						<span className="font-bold">B</span>
					</Toggle>
					<Toggle aria-label="Default">
						<span className="font-bold">B</span>
					</Toggle>
					<Toggle aria-label="Large" size="lg">
						<span className="font-bold">B</span>
					</Toggle>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">With text</p>
				<Toggle pressed>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="m12 2 2.39 7.36H22l-6.19 4.5L18.2 21 12 16.5 5.8 21l2.39-7.14L2 9.36h7.61z" />
					</svg>
					Starred
				</Toggle>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
				<div className="flex flex-wrap items-center gap-2">
					<Toggle aria-label="Disabled — off" disabled>
						<span>Off</span>
					</Toggle>
					<Toggle aria-label="Disabled — on" disabled defaultPressed>
						<span>On</span>
					</Toggle>
				</div>
			</div>
		</div>
	);
}
