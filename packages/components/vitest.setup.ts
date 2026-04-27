import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/*
 * jsdom does not implement ResizeObserver; Radix primitives that read element
 * size (Slider, ScrollArea, Tabs) crash on mount without it. A no-op shim is
 * sufficient — tests assert ARIA wiring, not layout.
 *
 * Patch on both `globalThis` and `window` so the shim survives a future
 * switch to happy-dom (which separates the two).
 */
if (typeof globalThis.ResizeObserver === "undefined") {
	const Stub = class {
		observe(): void {}
		unobserve(): void {}
		disconnect(): void {}
	};
	globalThis.ResizeObserver = Stub;
	if (typeof window !== "undefined" && typeof window.ResizeObserver === "undefined") {
		window.ResizeObserver = Stub;
	}
}

/*
 * jsdom doesn't implement Element.scrollIntoView; cmdk calls it when the
 * active item changes (e.g. opening a Combobox), which would otherwise crash
 * any test that opens a cmdk-backed component.
 */
if (
	typeof Element !== "undefined" &&
	typeof Element.prototype.scrollIntoView !== "function"
) {
	Element.prototype.scrollIntoView = function scrollIntoView(): void {};
}

// Avoid leaked DOM between tests — each test gets a clean slate.
afterEach(() => {
	cleanup();
});
