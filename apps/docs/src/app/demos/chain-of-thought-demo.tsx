import { ChainOfThought, Markdown } from "../../components/ui";

export function ChainOfThoughtDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<ChainOfThought
				defaultOpen
				steps={[
					{
						thought: "The user wants the bug in the auth module fixed.",
						action: "read auth.ts",
						observation: "200 lines, uses bcrypt + jwt; salt rounds default to 10.",
					},
					{
						thought: "Industry guidance is 12+ rounds for new code.",
						action: "grep for bcrypt.hash callers",
						observation: "Three callsites — login, signup, reset-password.",
					},
					{
						thought:
							"The bug is on line 42: signup doesn't pass a salt-rounds argument, so it defaults to 10.",
					},
				]}
				finalAnswer={
					<Markdown>{`**Fix:** pass \`12\` as the salt-rounds argument in \`signup.ts:42\` so signup matches login's hash strength.`}</Markdown>
				}
			/>
			<ChainOfThought
				steps={[
					{ thought: "User asked for a 3-step migration plan." },
					{ thought: "Step 1 is read-only — safe during business hours." },
					{ thought: "Steps 2-3 modify data — recommend Saturday 02:00 UTC." },
				]}
			/>
		</div>
	);
}
