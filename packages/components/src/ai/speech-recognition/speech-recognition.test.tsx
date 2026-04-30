import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SpeechRecognition } from "./speech-recognition.js";

interface MockInstance {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((event: { resultIndex: number; results: unknown }) => void) | null;
	onerror: ((event: { error: string; message?: string }) => void) | null;
	onend: (() => void) | null;
	start: ReturnType<typeof vi.fn>;
	stop: ReturnType<typeof vi.fn>;
	abort: ReturnType<typeof vi.fn>;
}

let lastInstance: MockInstance | null = null;

function makeMock(): MockInstance {
	const instance: MockInstance = {
		continuous: false,
		interimResults: false,
		lang: "",
		onresult: null,
		onerror: null,
		onend: null,
		start: vi.fn(),
		stop: vi.fn(),
		abort: vi.fn(),
	};
	lastInstance = instance;
	return instance;
}

function buildResults(parts: { transcript: string; isFinal: boolean }[]) {
	const list = parts.map((p) => ({
		isFinal: p.isFinal,
		length: 1,
		0: { transcript: p.transcript },
	}));
	return Object.assign(list, { length: list.length });
}

beforeEach(() => {
	lastInstance = null;
	(globalThis as unknown as { SpeechRecognition?: unknown }).SpeechRecognition = vi
		.fn()
		.mockImplementation(makeMock);
});

afterEach(() => {
	delete (globalThis as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
	delete (globalThis as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
});

describe("SpeechRecognition", () => {
	it("renders an enabled toggle when the API is available", () => {
		render(
			<SpeechRecognition
				isListening={false}
				onListeningChange={() => {}}
				onTranscript={() => {}}
			/>,
		);
		const button = screen.getByRole("button", { name: "Start dictation" });
		expect(button).toBeEnabled();
		expect(button).toHaveAttribute("aria-pressed", "false");
	});

	it("renders a disabled fallback when the API is missing", () => {
		delete (globalThis as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
		render(
			<SpeechRecognition
				isListening={false}
				onListeningChange={() => {}}
				onTranscript={() => {}}
			/>,
		);
		const button = screen.getByRole("button", {
			name: "Speech recognition not supported in this browser",
		});
		expect(button).toBeDisabled();
	});

	it("calls onListeningChange(true) when clicked while idle", async () => {
		const onListeningChange = vi.fn();
		render(
			<SpeechRecognition
				isListening={false}
				onListeningChange={onListeningChange}
				onTranscript={() => {}}
			/>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Start dictation" }));
		expect(onListeningChange).toHaveBeenCalledWith(true);
	});

	it("calls onListeningChange(false) when clicked while listening", async () => {
		const onListeningChange = vi.fn();
		render(
			<SpeechRecognition
				isListening={true}
				onListeningChange={onListeningChange}
				onTranscript={() => {}}
			/>,
		);
		// aria-label stays stable ("Start dictation"); aria-pressed conveys state.
		const button = screen.getByRole("button", { name: "Start dictation" });
		expect(button).toHaveAttribute("aria-pressed", "true");
		expect(button).toHaveAttribute("title", "Stop dictation");
		await userEvent.click(button);
		expect(onListeningChange).toHaveBeenCalledWith(false);
	});

	it("starts the recognition engine and applies lang/continuous/interim props", () => {
		render(
			<SpeechRecognition
				isListening={true}
				onListeningChange={() => {}}
				onTranscript={() => {}}
				lang="es-ES"
				continuous={false}
				interimResults={false}
			/>,
		);
		expect(lastInstance).not.toBeNull();
		expect(lastInstance?.start).toHaveBeenCalledOnce();
		expect(lastInstance?.lang).toBe("es-ES");
		expect(lastInstance?.continuous).toBe(false);
		expect(lastInstance?.interimResults).toBe(false);
	});

	it("emits transcripts via onTranscript with correct isFinal flag", () => {
		const onTranscript = vi.fn();
		render(
			<SpeechRecognition
				isListening={true}
				onListeningChange={() => {}}
				onTranscript={onTranscript}
			/>,
		);
		lastInstance?.onresult?.({
			resultIndex: 0,
			results: buildResults([
				{ transcript: "hello", isFinal: false },
				{ transcript: "world", isFinal: true },
			]),
		});
		expect(onTranscript).toHaveBeenNthCalledWith(1, "hello", false);
		expect(onTranscript).toHaveBeenNthCalledWith(2, "world", true);
	});

	it("only emits results from resultIndex onward", () => {
		const onTranscript = vi.fn();
		render(
			<SpeechRecognition
				isListening={true}
				onListeningChange={() => {}}
				onTranscript={onTranscript}
			/>,
		);
		lastInstance?.onresult?.({
			resultIndex: 1,
			results: buildResults([
				{ transcript: "old", isFinal: true },
				{ transcript: "new", isFinal: false },
			]),
		});
		expect(onTranscript).toHaveBeenCalledOnce();
		expect(onTranscript).toHaveBeenCalledWith("new", false);
	});

	it("forwards errors and toggles listening off (except for 'aborted')", () => {
		const onError = vi.fn();
		const onListeningChange = vi.fn();
		render(
			<SpeechRecognition
				isListening={true}
				onListeningChange={onListeningChange}
				onTranscript={() => {}}
				onError={onError}
			/>,
		);
		lastInstance?.onerror?.({ error: "not-allowed", message: "blocked" });
		expect(onError).toHaveBeenCalledWith("not-allowed", "blocked");
		expect(onListeningChange).toHaveBeenCalledWith(false);

		onListeningChange.mockClear();
		lastInstance?.onerror?.({ error: "aborted" });
		expect(onListeningChange).not.toHaveBeenCalled();
	});

	it("calls onListeningChange(false) on engine onend", () => {
		const onListeningChange = vi.fn();
		render(
			<SpeechRecognition
				isListening={true}
				onListeningChange={onListeningChange}
				onTranscript={() => {}}
			/>,
		);
		lastInstance?.onend?.();
		expect(onListeningChange).toHaveBeenCalledWith(false);
	});

	it("aborts the engine on unmount", () => {
		const { unmount } = render(
			<SpeechRecognition
				isListening={true}
				onListeningChange={() => {}}
				onTranscript={() => {}}
			/>,
		);
		const captured = lastInstance;
		unmount();
		expect(captured?.abort).toHaveBeenCalled();
	});

	it("rebuilds the engine when lang changes mid-session without bouncing isListening to false", () => {
		const onListeningChange = vi.fn();
		const { rerender } = render(
			<SpeechRecognition
				isListening={true}
				onListeningChange={onListeningChange}
				onTranscript={() => {}}
				lang="en-US"
			/>,
		);
		const first = lastInstance;
		expect(first?.lang).toBe("en-US");

		rerender(
			<SpeechRecognition
				isListening={true}
				onListeningChange={onListeningChange}
				onTranscript={() => {}}
				lang="es-ES"
			/>,
		);
		// Second instance constructed with the new lang.
		expect(lastInstance).not.toBe(first);
		expect(lastInstance?.lang).toBe("es-ES");
		// First instance was aborted during cleanup.
		expect(first?.abort).toHaveBeenCalled();
		// onend (synchronously fired by abort in some browsers) must NOT
		// bounce isListening to false during a prop-change rebuild.
		first?.onend?.();
		expect(onListeningChange).not.toHaveBeenCalledWith(false);
	});
});
