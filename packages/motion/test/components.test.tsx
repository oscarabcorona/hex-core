import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FadeIn } from "../src/components/fade-in/fade-in.js";
import { SlideIn } from "../src/components/slide-in/slide-in.js";
import { ScaleIn } from "../src/components/scale-in/scale-in.js";
import { BlurIn } from "../src/components/blur-in/blur-in.js";
import { Stagger } from "../src/components/stagger/stagger.js";
import { CountUp } from "../src/components/count-up/count-up.js";
import { Typewriter } from "../src/components/typewriter/typewriter.js";
import { MotionConfig } from "../src/react/MotionConfig.js";
import { manualClock } from "../src/engine/clock.js";
import type { Driver } from "../src/engine/driver.js";

function makeRecordingDriver() {
	const calls: Array<{ from: unknown; to: unknown; transition: unknown }> = [];
	const driver: Driver = {
		animate(_el, from, to, transition) {
			calls.push({ from, to, transition });
			return {
				finished: Promise.resolve(),
				pause: () => {},
				play: () => {},
				cancel: () => {},
				seek: () => {},
			};
		},
	};
	return { driver, calls };
}

describe("FadeIn", () => {
	it("issues an opacity 0 → 1 animation through the active driver", () => {
		const { driver, calls } = makeRecordingDriver();
		render(
			<MotionConfig driver={driver}>
				<FadeIn duration={200}>hi</FadeIn>
			</MotionConfig>,
		);
		expect(calls).toHaveLength(1);
		expect(calls[0].from).toEqual({ opacity: 0 });
		expect(calls[0].to).toEqual({ opacity: 1 });
	});
});

describe("SlideIn", () => {
	it("translates from a positive Y when direction='bottom'", () => {
		const { driver, calls } = makeRecordingDriver();
		render(
			<MotionConfig driver={driver}>
				<SlideIn direction="bottom" distance={32} fade={false}>
					hi
				</SlideIn>
			</MotionConfig>,
		);
		expect(calls[0].from).toEqual({ y: 32 });
		expect(calls[0].to).toEqual({ y: 0 });
	});

	it("uses x for left/right directions", () => {
		const { driver, calls } = makeRecordingDriver();
		render(
			<MotionConfig driver={driver}>
				<SlideIn direction="right" distance={20} fade={false}>
					hi
				</SlideIn>
			</MotionConfig>,
		);
		expect(calls[0].from).toEqual({ x: 20 });
		expect(calls[0].to).toEqual({ x: 0 });
	});
});

describe("ScaleIn", () => {
	it("scales from `from` (default 0.95) to 1 with synced opacity", () => {
		const { driver, calls } = makeRecordingDriver();
		render(
			<MotionConfig driver={driver}>
				<ScaleIn from={0.9}>hi</ScaleIn>
			</MotionConfig>,
		);
		expect(calls[0].from).toEqual({ scale: 0.9, opacity: 0 });
		expect(calls[0].to).toEqual({ scale: 1, opacity: 1 });
	});
});

describe("BlurIn", () => {
	it("animates a blur(N) → blur(0) filter", () => {
		const { driver, calls } = makeRecordingDriver();
		render(
			<MotionConfig driver={driver}>
				<BlurIn from={6} fade={false}>
					hi
				</BlurIn>
			</MotionConfig>,
		);
		expect(calls[0].from).toEqual({ filter: "blur(6px)", opacity: 1 });
		expect(calls[0].to).toEqual({ filter: "blur(0px)", opacity: 1 });
	});
});

describe("Stagger", () => {
	it("injects per-child delays at the configured gap", () => {
		const { driver, calls } = makeRecordingDriver();
		render(
			<MotionConfig driver={driver}>
				<Stagger gap={50}>
					<FadeIn>one</FadeIn>
					<FadeIn>two</FadeIn>
					<FadeIn>three</FadeIn>
				</Stagger>
			</MotionConfig>,
		);
		const delays = calls.map((c) => (c.transition as { delay?: number }).delay ?? 0);
		expect(delays).toEqual([0, 50, 100]);
	});

	it("reverses cascade direction when reverse=true", () => {
		const { driver, calls } = makeRecordingDriver();
		render(
			<MotionConfig driver={driver}>
				<Stagger gap={40} reverse>
					<FadeIn>a</FadeIn>
					<FadeIn>b</FadeIn>
					<FadeIn>c</FadeIn>
				</Stagger>
			</MotionConfig>,
		);
		const delays = calls.map((c) => (c.transition as { delay?: number }).delay ?? 0);
		// Order in `calls` follows render order (a, b, c); with reverse=true the
		// last child should fire first, so a's delay > b's > c's = 0.
		expect(delays).toEqual([80, 40, 0]);
	});
});

describe("CountUp", () => {
	it("starts at `from` and reaches `to` once the clock advances past duration", async () => {
		const clock = manualClock(0);
		render(
			<MotionConfig clock={clock} reducedMotion="never">
				<CountUp from={0} to={100} duration={1000} easing="linear" />
			</MotionConfig>,
		);
		// Initial render shows from value
		expect(screen.getByText("0")).toBeTruthy();
		// Halfway through
		await act(async () => {
			clock.advance(500);
			await Promise.resolve();
		});
		const halfway = Number.parseInt(screen.getByText(/^\d+$/).textContent ?? "0", 10);
		expect(halfway).toBeGreaterThan(0);
		expect(halfway).toBeLessThan(100);
		// Past the end
		await act(async () => {
			clock.advance(600);
			await Promise.resolve();
		});
		expect(screen.getByText("100")).toBeTruthy();
	});

	it("snaps to the target when reduced-motion is forced", async () => {
		render(
			<MotionConfig reducedMotion="always">
				<CountUp from={0} to={1234} />
			</MotionConfig>,
		);
		// Effect is sync via useEffect; flush.
		await act(async () => {
			await Promise.resolve();
		});
		expect(screen.getByText("1,234")).toBeTruthy();
	});
});

describe("Typewriter", () => {
	it("reveals characters as the clock advances", async () => {
		const clock = manualClock(0);
		render(
			<MotionConfig clock={clock} reducedMotion="never">
				<Typewriter text="Hello" speed={50} cursor={false} />
			</MotionConfig>,
		);
		// On mount, no chars revealed yet (the effect just scheduled)
		expect(screen.queryByText("Hello")).toBeNull();
		await act(async () => {
			clock.advance(50);
			await Promise.resolve();
		});
		expect(screen.getByText("H")).toBeTruthy();
		await act(async () => {
			clock.advance(200);
			await Promise.resolve();
		});
		expect(screen.getByText("Hello")).toBeTruthy();
	});

	it("snaps to the full text under reduced-motion", async () => {
		render(
			<MotionConfig reducedMotion="always">
				<Typewriter text="Instant" speed={50} cursor={false} />
			</MotionConfig>,
		);
		await act(async () => {
			await Promise.resolve();
		});
		expect(screen.getByText("Instant")).toBeTruthy();
	});
});
