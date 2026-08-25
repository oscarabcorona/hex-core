"use client";

import { useState } from "react";
import { Branch, Message } from "@hex-core/components";

const ALTERNATIVES = [
	"Paris is the capital of France — population 2.1M in the city proper, 12M in the metro.",
	"The capital of France is Paris. It sits on the Seine in the north-central region of the country.",
	"France's capital is Paris, located in the Île-de-France region.",
];

export function BranchDemo() {
	const [index, setIndex] = useState(1);
	return (
		<div className="flex w-full max-w-lg flex-col gap-4">
			<Branch current={index} total={ALTERNATIVES.length} onCurrentChange={setIndex}>
				<Message role="assistant">{ALTERNATIVES[index]}</Message>
			</Branch>
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Read-only (no onCurrentChange)</p>
				<Branch current={0} total={1}>
					<Message role="assistant">{ALTERNATIVES[0]}</Message>
				</Branch>
			</div>
		</div>
	);
}
