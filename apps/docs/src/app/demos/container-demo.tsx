import { Container } from "../../components/ui";

const sizes = [
	{ size: "sm", label: "sm — 33rem" },
	{ size: "md", label: "md — 40rem" },
	{ size: "lg", label: "lg — 50rem (default)" },
	{ size: "xl", label: "xl — 66rem" },
] as const;

/**
 * Container demo: max-width clamp shown across the four size variants. Each
 * row renders a Container with a tinted background so the clamp is visible
 * relative to the parent's full width.
 */
export function ContainerDemo() {
	return (
		<div className="flex w-full max-w-3xl flex-col gap-3">
			{sizes.map(({ size, label }) => (
				<div key={size} className="rounded-md bg-muted/20 p-1">
					<Container size={size} padding="sm">
						<div className="flex h-8 items-center justify-center rounded-sm bg-foreground/10 text-xs font-mono text-foreground/70">
							{label}
						</div>
					</Container>
				</div>
			))}
		</div>
	);
}
