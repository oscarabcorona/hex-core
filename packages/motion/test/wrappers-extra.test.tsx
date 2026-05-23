import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pulse } from "../src/components/pulse/pulse.js";
import { Bounce } from "../src/components/bounce/bounce.js";
import { Shine } from "../src/components/shine/shine.js";
import { Marquee } from "../src/components/marquee/marquee.js";
import { Shake } from "../src/components/shake/shake.js";
import { Parallax } from "../src/components/parallax/parallax.js";
import { PageTransition } from "../src/components/page-transition/page-transition.js";
import { MotionConfig } from "../src/react/MotionConfig.js";

/**
 * Coverage for the 7 wrappers that don't go through the recording driver
 * (they call `el.animate()` directly OR don't animate at all). We check
 * the rendered DOM shape, the reduced-motion bypass, and consumer-prop
 * pass-through. WAAPI side-effects are hard to introspect under jsdom's
 * shim, so these tests stay structural.
 */

describe("Pulse", () => {
	it("renders the host wrapper with children + className", () => {
		const { container } = render(
			<MotionConfig reducedMotion="always">
				<Pulse className="probe">heart</Pulse>
			</MotionConfig>,
		);
		const node = container.querySelector(".probe");
		expect(node).toBeTruthy();
		expect(node?.textContent).toBe("heart");
	});
});

describe("Bounce", () => {
	it("starts at opacity 0 under user-mode (animation will fade it in)", () => {
		render(<Bounce>landing</Bounce>);
		const el = screen.getByText("landing") as HTMLElement;
		expect(el.style.opacity).toBe("0");
	});
	it("starts at opacity 1 under reduced-motion (no flicker)", () => {
		render(
			<MotionConfig reducedMotion="always">
				<Bounce>landing</Bounce>
			</MotionConfig>,
		);
		const el = screen.getByText("landing") as HTMLElement;
		expect(el.style.opacity).toBe("1");
	});
});

describe("Shine", () => {
	it("paints an inline gradient and a starting backgroundPosition", () => {
		render(<Shine className="probe">overlay</Shine>);
		const el = screen.getByText("overlay") as HTMLElement;
		expect(el.style.backgroundImage).toContain("linear-gradient");
		// jsdom normalizes the unitless 0 to 0px in inline styles.
		expect(el.style.backgroundPosition).toMatch(/^-100% 0(px)?$/);
	});
	it("accepts a consumer-supplied color", () => {
		render(<Shine color="rgb(0, 128, 255)">x</Shine>);
		const el = screen.getByText("x") as HTMLElement;
		expect(el.style.backgroundImage).toContain("rgb(0, 128, 255)");
	});
});

describe("Marquee", () => {
	it("renders two duplicated track halves; the second is aria-hidden", () => {
		const { container } = render(
			<Marquee>
				<span>logo</span>
			</Marquee>,
		);
		const ariaHidden = container.querySelectorAll('[aria-hidden="true"]');
		expect(ariaHidden.length).toBeGreaterThanOrEqual(1);
		// Both copies of `logo` must be rendered
		const logos = screen.getAllByText("logo");
		expect(logos).toHaveLength(2);
	});
});

describe("Shake", () => {
	it("renders the host element + child unchanged on first render", () => {
		render(
			<Shake trigger={0}>
				<input data-testid="probe" />
			</Shake>,
		);
		expect(screen.getByTestId("probe")).toBeTruthy();
	});
	it("does not crash when trigger changes under reduced-motion", () => {
		const { rerender } = render(
			<MotionConfig reducedMotion="always">
				<Shake trigger={0}>
					<input data-testid="probe" />
				</Shake>
			</MotionConfig>,
		);
		rerender(
			<MotionConfig reducedMotion="always">
				<Shake trigger={1}>
					<input data-testid="probe" />
				</Shake>
			</MotionConfig>,
		);
		expect(screen.getByTestId("probe")).toBeTruthy();
	});
});

describe("Parallax", () => {
	it("pins translation to 0 under reduced-motion", () => {
		render(
			<MotionConfig reducedMotion="always">
				<Parallax offset={100}>content</Parallax>
			</MotionConfig>,
		);
		const el = screen.getByText("content") as HTMLElement;
		expect(el.style.transform).toBe("translateY(0px)");
	});
	it("respects the axis prop", () => {
		render(
			<MotionConfig reducedMotion="always">
				<Parallax offset={50} axis="x">
					content
				</Parallax>
			</MotionConfig>,
		);
		const el = screen.getByText("content") as HTMLElement;
		expect(el.style.transform).toBe("translateX(0px)");
	});
});

describe("PageTransition", () => {
	it("wraps children in a keyed Motion.div inside Presence", () => {
		const { container } = render(
			<PageTransition pageKey="/home">
				<section data-testid="page">home</section>
			</PageTransition>,
		);
		// Presence + Motion.div renders the section through; we verify the
		// child is in the DOM.
		expect(container.querySelector('[data-testid="page"]')).toBeTruthy();
	});
	it("re-renders when pageKey changes (route change)", async () => {
		const { rerender } = render(
			<PageTransition pageKey="/home">
				<section>home</section>
			</PageTransition>,
		);
		expect(screen.getByText("home")).toBeTruthy();
		rerender(
			<PageTransition pageKey="/docs">
				<section>docs</section>
			</PageTransition>,
		);
		// Both may exist briefly during the exit animation; the new one must
		// be present.
		await act(async () => {
			await Promise.resolve();
		});
		expect(screen.getByText("docs")).toBeTruthy();
	});
});
