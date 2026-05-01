import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AudioPlayer } from "./audio-player.js";

const wsHandlers: Record<string, ((arg?: unknown) => void) | undefined> = {};
const wsMock = {
	on: vi.fn((event: string, cb: (arg?: unknown) => void) => {
		wsHandlers[event] = cb;
	}),
	load: vi.fn(),
	playPause: vi.fn(),
	play: vi.fn(),
	getDuration: vi.fn(() => 120),
	destroy: vi.fn(),
};

vi.mock("wavesurfer.js", () => ({
	default: {
		create: vi.fn(() => wsMock),
	},
}));

describe("AudioPlayer", () => {
	it("renders the player container with the play button labeled 'Play' and disabled until ready", async () => {
		render(<AudioPlayer src="/sample.mp3" />);
		const button = await screen.findByRole("button", { name: "Play" });
		expect(button).toBeDisabled();
	});

	it("enables the button and shows duration once wavesurfer fires 'ready'", async () => {
		render(<AudioPlayer src="/sample.mp3" />);
		await waitFor(() => expect(wsHandlers.ready).toBeDefined());
		wsHandlers.ready?.();
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
		});
		expect(screen.getByText(/0:00 \/ 2:00/)).toBeInTheDocument();
	});

	it("flips the aria-label to 'Pause' when wavesurfer fires 'play'", async () => {
		render(<AudioPlayer src="/sample.mp3" />);
		await waitFor(() => expect(wsHandlers.ready).toBeDefined());
		wsHandlers.ready?.();
		wsHandlers.play?.();
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
		});
	});

	it("calls onEnded when wavesurfer fires 'finish'", async () => {
		const onEnded = vi.fn();
		render(<AudioPlayer src="/sample.mp3" onEnded={onEnded} />);
		await waitFor(() => expect(wsHandlers.finish).toBeDefined());
		wsHandlers.finish?.();
		expect(onEnded).toHaveBeenCalledOnce();
	});

	it("calls onError with the engine's error message", async () => {
		const onError = vi.fn();
		render(<AudioPlayer src="/sample.mp3" onError={onError} />);
		await waitFor(() => expect(wsHandlers.error).toBeDefined());
		wsHandlers.error?.(new Error("404 Not Found"));
		expect(onError).toHaveBeenCalledWith("404 Not Found");
	});

	it("auto-plays after ready when autoPlay is set", async () => {
		render(<AudioPlayer src="/sample.mp3" autoPlay />);
		await waitFor(() => expect(wsHandlers.ready).toBeDefined());
		wsMock.play.mockClear();
		wsHandlers.ready?.();
		expect(wsMock.play).toHaveBeenCalled();
	});
});
