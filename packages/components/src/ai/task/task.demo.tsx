import { Task } from "@hex-core/components";

export function TaskDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<Task
				label="Refactoring auth module"
				steps={[
					{ id: "read", label: "Read existing auth", state: "result" },
					{
						id: "plan",
						label: "Plan token rotation",
						state: "result",
						detail: "Identified 3 callsites that need migration.",
					},
					{ id: "apply", label: "Apply changes", state: "running" },
					{ id: "test", label: "Run tests", state: "pending" },
					{ id: "verify", label: "Verify with QA", state: "pending" },
				]}
			/>
			<Task
				label="Migrate users table"
				durationMs={12_400}
				steps={[
					{ id: "a", label: "Plan migration", state: "result" },
					{ id: "b", label: "Apply migration", state: "result" },
					{ id: "c", label: "Verify integrity", state: "result" },
				]}
			/>
			<Task
				label="Deploy to staging"
				steps={[
					{ id: "build", label: "Build container", state: "result" },
					{
						id: "push",
						label: "Push to registry",
						state: "error",
						detail: "Auth failed — token expired.",
					},
				]}
			/>
			<Task
				steps={[
					{ id: "queued", label: "Index 12k documents", state: "pending" },
					{ id: "search", label: "Build vector search", state: "pending" },
					{ id: "deploy", label: "Deploy retriever", state: "pending" },
				]}
			/>
		</div>
	);
}
