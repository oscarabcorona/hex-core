import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AudioWaveform } from "./audio-waveform.js";

const handlers: Record<string, ((arg?: unknown) => void) | undefined> = {};
const wsMock = {
	on: vi.fn((event: string, cb: (arg?: unknown) => void) => {
		handlers[event] = cb;
	}),
	load: vi.fn(),
	getDuration: vi.fn(() => 30),
	destroy: vi.fn(),
};

vi.mock("wavesurfer.js", () => ({
	default: { create: vi.fn(() => wsMock) },
}));

describe("AudioWaveform", () => {
	it("renders the container with the data attribute", () => {
		const { container } = render(<AudioWaveform src="/clip.mp3" />);
		expect(container.querySelector("[data-hex-audio-waveform]")).not.toBeNull();
	});

	it("calls onReady with the engine's reported duration", async () => {
		const onReady = vi.fn();
		render(<AudioWaveform src="/clip.mp3" onReady={onReady} />);
		await waitFor(() => expect(handlers.ready).toBeDefined());
		handlers.ready?.();
		expect(onReady).toHaveBeenCalledWith(30);
	});

	it("calls onError with the engine's error message", async () => {
		const onError = vi.fn();
		render(<AudioWaveform src="/clip.mp3" onError={onError} />);
		await waitFor(() => expect(handlers.error).toBeDefined());
		handlers.error?.(new Error("decode failed"));
		expect(onError).toHaveBeenCalledWith("decode failed");
	});

	it("applies custom className", () => {
		const { container } = render(
			<AudioWaveform src="/clip.mp3" className="custom-wave" />,
		);
		const el = container.querySelector("[data-hex-audio-waveform]");
		expect(el?.className).toContain("custom-wave");
	});
});
