import { ToolCall } from "@hex-core/components";

export function ToolCallDemo() {
	return (
		<div className="flex w-full max-w-lg flex-col gap-3">
			<ToolCall
				name="searchDocs"
				state="result"
				args={{ query: "auth" }}
				result={{ hits: 12 }}
			/>
			<ToolCall
				name="fetchUser"
				state="running"
				args={{ userId: "u_91x4" }}
			/>
		</div>
	);
}
