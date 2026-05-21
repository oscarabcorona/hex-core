import { InlineCitation } from "../../components/ui";

export function InlineCitationDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-4 text-sm">
			<p>
				Recent papers benchmark multimodal reasoning across the major frontier models
				<InlineCitation
					index={1}
					title="Anthropic — Claude Sonnet 4.5 model card"
					url="https://anthropic.com/news/claude-sonnet-4-5"
					excerpt="Reports tool-use evals + chain-of-thought traces alongside multimodal benchmarks."
				/>
				. Earlier work established the constitutional-AI method
				<InlineCitation
					index={2}
					title="Constitutional AI: A method for training"
					url="https://anthropic.com/research/constitutional-ai"
				/>
				, which several frontier labs cite in their alignment work.
			</p>
			<p>
				Internal references work too — a model citing a private RFC
				<InlineCitation
					index={3}
					title="RFC #42 — internal-only"
					excerpt="Stored in the company wiki; no public URL."
				/>
				renders without an anchor, but stays keyboard-focusable so the
				preview opens for AT users too.
			</p>
			<p className="text-xs text-muted-foreground">Hover (or focus) the [N] markers to see the source preview.</p>
		</div>
	);
}
