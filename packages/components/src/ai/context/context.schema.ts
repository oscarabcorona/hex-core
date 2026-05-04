import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const contextSchema: ComponentSchemaDefinition = {
	name: "context",
	displayName: "Context",
	description:
		"Context-window utilization meter — shows tokens consumed vs the model's max context with a horizontal progress bar. Severity colors gate at 75% (warning) and 90% (danger). Composes the `Progress` primitive.",
	category: "ai",
	subcategory: "agent",
	props: [
		{
			name: "used",
			type: "number",
			required: true,
			description: "Tokens consumed so far. Clamped to [0, max] for display.",
		},
		{
			name: "max",
			type: "number",
			required: true,
			description: "Total context window in tokens.",
		},
		{
			name: "label",
			type: "string",
			required: false,
			default: "Context window",
			description: "Override the leading label shown beside the token counts.",
		},
		{
			name: "warningAt",
			type: "number",
			required: false,
			default: 0.75,
			description: "Threshold (0–1) to flip the bar to the warning color.",
		},
		{
			name: "dangerAt",
			type: "number",
			required: false,
			default: 0.9,
			description: "Threshold (0–1) to flip the bar to the danger color.",
		},
		{
			name: "className",
			type: "string",
			required: false,
			description: "Additional CSS classes on the root.",
		},
	],
	variants: [],
	slots: [],
	dependencies: {
		npm: ["@radix-ui/react-progress", "clsx", "tailwind-merge"],
		internal: ["lib/utils", "primitives/progress/progress"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["foreground", "muted-foreground", "primary", "destructive", "secondary"],
	examples: [
		{
			title: "Basic context meter",
			description: "Show 47k of 200k tokens used.",
			code: '<Context used={47_000} max={200_000} />',
			composition: ["agent", "context", "telemetry"],
		},
		{
			title: "Custom severity thresholds",
			description: "Tighten thresholds for a tighter context budget (e.g. when the agent's safety buffer is larger).",
			code: '<Context used={tokens} max={ctxWindow} warningAt={0.6} dangerAt={0.8} />',
			composition: ["agent", "context"],
		},
		{
			title: "Renamed label for non-token surfaces",
			description: "Pass a custom label for surfaces that count something other than \"context window\" (e.g. \"Document budget\" for RAG cards).",
			code: '<Context used={chunks} max={maxChunks} label="Retrieved chunks" />',
			composition: ["agent", "rag"],
		},
	],
	ai: {
		whenToUse:
			"In an agent dashboard, chat header, or telemetry panel — anywhere the user benefits from seeing how much of the model's context window has been consumed. Pair with `<Trace>` so the user can correlate context spend with the agent's decisions.",
		whenNotToUse:
			"Don't use for arbitrary progress bars (use `<Progress>` directly). Don't use for in-flight task progress (use `<Task>`). Don't use without a max — meaningless without an upper bound to compute the ratio against.",
		commonMistakes: [
			"Passing `max=0` — produces a divide-by-zero silently floored to `1` for safety; pass the model's actual context window even when the conversation is empty",
			"Setting `warningAt > dangerAt` — the danger threshold takes precedence, but the visual is confusing; keep `0 < warningAt < dangerAt < 1`",
			"Counting `used` against the model's TOTAL context rather than the AVAILABLE context (subtract system prompt + reserved output tokens) — the user sees a spuriously low utilization until the buffer fills",
			"Rendering the meter with a 1px-thin design — the severity color is the load-bearing signal; keep the default Progress height (h-2) so the threshold flip is visible at a glance",
		],
		relatedComponents: ["progress", "trace", "task"],
		accessibilityNotes:
			"The `<Progress>` indicator carries `aria-label` set to \"Context window: NN% used\" so screen readers announce both the surface name and the percentage. The token counts in the header read as plain text — AT users hear the percentage from the bar's aria-label rather than parsing the visual \"47k of 200k\" formatting. Severity is conveyed by both color (visual) and `aria-valuenow` (programmatic), so the warning state isn't color-only. Note: the warning color uses `var(--color-warning,oklch(0.78_0.16_82))` with a hardcoded OKLCH fallback; the `--color-warning` token is not yet shipped by `@hex-core/tokens`, so the fallback is what every theme renders today (matches `<Timeline>`'s `warning` status). A future tokens-package change will plumb a real `warning` token through the design system; until then dark/branded themes can override by setting `--color-warning` on `:root` or `.dark`.",
		tokenBudget: 200,
	},
	tags: ["ai", "agent", "context", "telemetry", "progress", "tokens"],
};
