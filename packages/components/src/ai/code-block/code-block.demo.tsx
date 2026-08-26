import { CodeBlock } from "@hex-core/components";

export function CodeBlockDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<CodeBlock label="pnpm" code="pnpm add @hex-core/components" />
			<CodeBlock label="npm" code="npm install @hex-core/components" />
		</div>
	);
}
