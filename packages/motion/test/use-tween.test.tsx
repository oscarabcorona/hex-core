import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { useTween } from "../src/react/useTween.js";
import { MotionConfig } from "../src/react/MotionConfig.js";
import { manualClock } from "../src/engine/clock.js";

describe("useTween", () => {
	it("interpolates linearly when easing='linear'", () => {
		const clock = manualClock(0);
		const wrapper = ({ children }: { children: ReactNode }) => (
			<MotionConfig clock={clock} reducedMotion="never">
				{children}
			</MotionConfig>
		);
		const { result } = renderHook(
			() => useTween(0, 100, { duration: 1000, easing: "linear" }),
			{ wrapper },
		);
		expect(result.current.get()).toBe(0);
		act(() => {
			clock.advance(500);
		});
		expect(result.current.get()).toBeCloseTo(50, 1);
		act(() => {
			clock.advance(500);
		});
		expect(result.current.get()).toBe(100);
	});

	it("snaps to `to` immediately under reduced-motion", () => {
		const wrapper = ({ children }: { children: ReactNode }) => (
			<MotionConfig reducedMotion="always">{children}</MotionConfig>
		);
		const { result } = renderHook(() => useTween(0, 250, { duration: 800 }), { wrapper });
		expect(result.current.get()).toBe(250);
	});

	it("snaps to `to` immediately when duration <= 0", () => {
		const clock = manualClock(0);
		const wrapper = ({ children }: { children: ReactNode }) => (
			<MotionConfig clock={clock} reducedMotion="never">
				{children}
			</MotionConfig>
		);
		const { result } = renderHook(() => useTween(0, 7, { duration: 0 }), { wrapper });
		expect(result.current.get()).toBe(7);
	});
});
