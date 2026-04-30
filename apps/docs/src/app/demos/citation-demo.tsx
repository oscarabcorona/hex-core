import { Citation, Cluster } from "../../components/ui";

const SOURCES = [
	{ id: "1", title: "OpenAI — GPT-4 Technical Report", url: "https://openai.com/research/gpt-4" },
	{ id: "2", title: "Anthropic — Constitutional AI", url: "https://www.anthropic.com/research" },
	{ id: "3", title: "Google DeepMind — Gemini", url: "https://deepmind.google/technologies/gemini/" },
];

export function CitationDemo() {
	return (
		<div className="w-full max-w-lg">
			<p className="mb-3 text-sm leading-relaxed">
				Recent papers benchmark multimodal reasoning across the major frontier models, with each
				lab publishing tooling-use evals alongside chain-of-thought traces.
			</p>
			<Cluster gap="xs">
				{SOURCES.map((s, i) => (
					<Citation key={s.id} title={s.title} url={s.url} index={i + 1} />
				))}
			</Cluster>
		</div>
	);
}
