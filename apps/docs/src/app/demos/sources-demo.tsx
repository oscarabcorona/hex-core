import { Sources } from "../../components/ui";

const SAMPLE_SOURCES = [
	{
		title: "Anthropic — Claude Sonnet 4.5 model card",
		url: "https://anthropic.com/news/claude-sonnet-4-5",
	},
	{
		title: "Constitutional AI: A method for training",
		url: "https://anthropic.com/research/constitutional-ai",
		page: 7,
	},
	{
		title: "Internal RFC: streaming-safe markdown",
		url: "https://example.com/rfc/streaming",
	},
];

export function SourcesDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Open by default</p>
				<Sources sources={SAMPLE_SOURCES} />
			</div>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Collapsed</p>
				<Sources sources={SAMPLE_SOURCES.slice(0, 1)} defaultOpen={false} />
			</div>
		</div>
	);
}
