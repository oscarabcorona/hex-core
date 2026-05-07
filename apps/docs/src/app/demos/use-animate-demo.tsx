"use client";

import { useAnimate } from "@hex-core/motion";

/**
 * Imperative chain. The click handler awaits each animation's
 * `finished` Promise before kicking off the next one — neither setTimeout
 * nor render-time state involved.
 */
export function UseAnimateDemo() {
	const [scope, animate] = useAnimate<HTMLDivElement>();

	const onClick = async () => {
		const target = scope.current;
		if (!target) return;
		await animate(target, { x: 60 }, { duration: 200, easing: "standard" }).finished;
		await animate(target, { x: 0 }, { duration: 200, easing: "emphasized" }).finished;
	};

	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<button
				type="button"
				onClick={onClick}
				className="self-start rounded-md border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
			>
				Run sequence
			</button>
			<div
				ref={scope}
				className="h-12 w-12 rounded-md border bg-card"
			/>
		</div>
	);
}
