import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Motion } from "../src/react/Motion.js";
import { Presence } from "../src/react/Presence.js";
import { MotionConfig } from "../src/react/MotionConfig.js";
import { useAnimate } from "../src/react/useAnimate.js";
import type { Driver } from "../src/engine/driver.js";

/**
 * Build a fake driver that records every animate() call and returns a
 * controllable RunningAnimation. Tests resolve the `finished` Promise
 * imperatively to drive Presence's exit lifecycle deterministically —
 * no reliance on the WAAPI shim's timing.
 */
function makeRecordingDriver() {
	const calls: Array<{
		element: Element;
		from: unknown;
		to: unknown;
	}> = [];
	const resolvers: Array<() => void> = [];
	const driver: Driver = {
		animate(element, from, to) {
			calls.push({ element, from, to });
			let resolve!: () => void;
			const finished = new Promise<void>((r) => {
				resolve = r;
			});
			resolvers.push(resolve);
			return {
				finished,
				pause: () => {},
				play: () => {},
				cancel: () => {},
				seek: () => {},
			};
		},
	};
	return {
		driver,
		calls,
		resolveLast() {
			const r = resolvers.pop();
			if (r) r();
		},
		resolveAll() {
			while (resolvers.length) resolvers.pop()!();
		},
	};
}

describe("<Motion>", () => {
	it("renders the requested host tag with consumer props passing through", () => {
		render(<Motion.div data-testid="m" className="probe" />);
		const el = screen.getByTestId("m");
		expect(el.tagName).toBe("DIV");
		expect(el.className).toBe("probe");
	});

	it("invokes the driver on mount with initial → animate keyframes", () => {
		const { driver, calls } = makeRecordingDriver();
		render(
			<MotionConfig driver={driver}>
				<Motion.div
					data-testid="m"
					initial={{ x: 0, opacity: 0 }}
					animate={{ x: 100, opacity: 1 }}
					transition={{ duration: 200 }}
				/>
			</MotionConfig>,
		);
		expect(calls).toHaveLength(1);
		expect(calls[0].from).toEqual({ x: 0, opacity: 0 });
		expect(calls[0].to).toEqual({ x: 100, opacity: 1 });
	});

	it("re-runs the animation only on structural change to `animate`, not every render", () => {
		const { driver, calls } = makeRecordingDriver();
		// Re-rendering with an equivalent object literal should NOT re-run.
		const { rerender } = render(
			<MotionConfig driver={driver}>
				<Motion.div data-testid="m" animate={{ x: 100 }} />
			</MotionConfig>,
		);
		const mountCalls = calls.length;
		rerender(
			<MotionConfig driver={driver}>
				<Motion.div data-testid="m" animate={{ x: 100 }} />
			</MotionConfig>,
		);
		expect(calls.length).toBe(mountCalls);

		// Real change → one extra call.
		rerender(
			<MotionConfig driver={driver}>
				<Motion.div data-testid="m" animate={{ x: 200 }} />
			</MotionConfig>,
		);
		expect(calls.length).toBe(mountCalls + 1);
	});
});

describe("<Presence>", () => {
	it("keeps the leaving child mounted until its exit animation resolves", async () => {
		const rec = makeRecordingDriver();
		const { rerender } = render(
			<MotionConfig driver={rec.driver}>
				<Presence>
					<Motion.div key="card" data-testid="card" exit={{ opacity: 0 }} />
				</Presence>
			</MotionConfig>,
		);
		expect(screen.getByTestId("card")).toBeTruthy();

		// Trigger the exit by removing the child.
		rerender(
			<MotionConfig driver={rec.driver}>
				<Presence>{null}</Presence>
			</MotionConfig>,
		);

		// Still mounted — exit animation hasn't resolved yet.
		expect(screen.queryByTestId("card")).not.toBeNull();

		// Resolve the driver's `finished` Promise; React unmounts on the
		// next microtask + state flush.
		await act(async () => {
			rec.resolveAll();
			// Give React's setState scheduler a tick.
			await Promise.resolve();
		});
		expect(screen.queryByTestId("card")).toBeNull();
	});

	it("unmounts immediately when the leaving child has no exit prop", async () => {
		const rec = makeRecordingDriver();
		const { rerender } = render(
			<MotionConfig driver={rec.driver}>
				<Presence>
					<Motion.div key="card" data-testid="card" />
				</Presence>
			</MotionConfig>,
		);
		expect(screen.getByTestId("card")).toBeTruthy();

		rerender(
			<MotionConfig driver={rec.driver}>
				<Presence>{null}</Presence>
			</MotionConfig>,
		);

		// queueMicrotask drains in act().
		await act(async () => {
			await Promise.resolve();
		});
		expect(screen.queryByTestId("card")).toBeNull();
	});
});

describe("useAnimate", () => {
	it("returns a no-op handle when the target is null", async () => {
		const rec = makeRecordingDriver();
		let handleFinished: Promise<void> | null = null;
		function Probe() {
			const [, animate] = useAnimate<HTMLDivElement>();
			if (!handleFinished) {
				handleFinished = animate(null, { x: 50 }).finished;
			}
			return <div data-testid="probe" />;
		}
		render(
			<MotionConfig driver={rec.driver}>
				<Probe />
			</MotionConfig>,
		);
		expect(rec.calls).toHaveLength(0);
		await expect(handleFinished).resolves.toBeUndefined();
	});

	it("hands the consumer's target to the active driver", async () => {
		const rec = makeRecordingDriver();
		const onClick = vi.fn();
		function Probe() {
			const [scope, animate] = useAnimate<HTMLDivElement>();
			return (
				<div
					ref={scope}
					data-testid="probe"
					onClick={() => {
						animate(scope.current, { x: 100 }, { duration: 150 });
						onClick();
					}}
				/>
			);
		}
		render(
			<MotionConfig driver={rec.driver}>
				<Probe />
			</MotionConfig>,
		);
		await act(async () => {
			screen.getByTestId("probe").click();
		});
		expect(onClick).toHaveBeenCalledOnce();
		expect(rec.calls).toHaveLength(1);
		expect(rec.calls[0].to).toEqual({ x: 100 });
	});
});
