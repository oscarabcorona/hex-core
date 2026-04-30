import { Loading } from "../../components/ui";

export function LoadingDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">List</p>
				<Loading rows={4} variant="list" />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Card</p>
				<Loading variant="card" />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Stack</p>
				<Loading rows={3} variant="stack" />
			</div>
		</div>
	);
}
