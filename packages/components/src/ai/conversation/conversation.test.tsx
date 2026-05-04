import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Conversation, type ConversationMessage } from "./conversation.js";

const HISTORY: ConversationMessage[] = [
	{ id: "u1", role: "user", content: "What's the capital of France?" },
	{ id: "a1", role: "assistant", content: "Paris." },
];

describe("Conversation — message stream", () => {
	it("renders one Message per item in the messages array", () => {
		render(<Conversation messages={HISTORY} onSubmit={() => undefined} />);
		expect(screen.getByText(/capital of france/i)).toBeInTheDocument();
		expect(screen.getByText(/paris/i)).toBeInTheDocument();
	});

	it("renders a Shimmer placeholder when isStreaming is true", () => {
		render(
			<Conversation messages={HISTORY} onSubmit={() => undefined} isStreaming />,
		);
		// Shimmer renders a `role="status"` region.
		expect(screen.getByRole("status")).toBeInTheDocument();
	});

	it("does not render a Shimmer when isStreaming is false (default)", () => {
		render(<Conversation messages={HISTORY} onSubmit={() => undefined} />);
		expect(screen.queryByRole("status")).toBeNull();
	});
});

describe("Conversation — sources panel", () => {
	it("does not render Sources when none are provided", () => {
		render(<Conversation messages={HISTORY} onSubmit={() => undefined} />);
		expect(screen.queryByText(/source/i)).toBeNull();
	});

	it("does not render Sources when an empty array is provided", () => {
		render(<Conversation messages={HISTORY} onSubmit={() => undefined} sources={[]} />);
		expect(screen.queryByText(/source/i)).toBeNull();
	});

	it("renders the Sources panel when sources are provided", () => {
		render(
			<Conversation
				messages={HISTORY}
				onSubmit={() => undefined}
				sources={[{ title: "Wikipedia: Paris", url: "https://en.wikipedia.org/wiki/Paris" }]}
			/>,
		);
		expect(screen.getByText("1 source")).toBeInTheDocument();
	});
});

describe("Conversation — composer", () => {
	it("renders a textarea with the placeholder", () => {
		render(
			<Conversation messages={HISTORY} onSubmit={() => undefined} placeholder="Ask the docs…" />,
		);
		expect(screen.getByPlaceholderText("Ask the docs…")).toBeInTheDocument();
	});

	it("submits the trimmed text on Enter and clears the input", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<Conversation messages={[]} onSubmit={onSubmit} />);
		const input = screen.getByPlaceholderText("Ask anything…") as HTMLTextAreaElement;
		await user.type(input, "  hello world  ");
		await user.keyboard("{Enter}");
		expect(onSubmit).toHaveBeenCalledWith("hello world");
		expect(input.value).toBe("");
	});

	it("disables the textarea when disabled is true", () => {
		render(<Conversation messages={HISTORY} onSubmit={() => undefined} disabled />);
		expect(screen.getByPlaceholderText("Ask anything…")).toBeDisabled();
	});

	it("renders composerActions in the trailing slot", () => {
		render(
			<Conversation
				messages={HISTORY}
				onSubmit={() => undefined}
				composerActions={<button type="submit">Send</button>}
			/>,
		);
		expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
	});

	it("disables the textarea but leaves consumer-supplied composerActions buttons clickable when disabled", () => {
		render(
			<Conversation
				messages={HISTORY}
				onSubmit={() => undefined}
				disabled
				composerActions={<button type="button">Stop</button>}
			/>,
		);
		expect(screen.getByPlaceholderText("Ask anything…")).toBeDisabled();
		// `disabled` only propagates to the textarea — composerActions are the consumer's responsibility.
		expect(screen.getByRole("button", { name: /stop/i })).not.toBeDisabled();
	});
});

describe("Conversation — controlled composer", () => {
	it("uses controlled value and calls onValueChange on input", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<Conversation
				messages={[]}
				onSubmit={() => undefined}
				value="prefilled"
				onValueChange={onChange}
			/>,
		);
		const input = screen.getByPlaceholderText("Ask anything…") as HTMLTextAreaElement;
		expect(input.value).toBe("prefilled");
		await user.type(input, "x");
		expect(onChange).toHaveBeenCalled();
	});

	it("clears the controlled value via onValueChange when the user submits", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const onSubmit = vi.fn();
		render(
			<Conversation
				messages={[]}
				onSubmit={onSubmit}
				value="hello"
				onValueChange={onChange}
			/>,
		);
		const input = screen.getByPlaceholderText("Ask anything…") as HTMLTextAreaElement;
		input.focus();
		await user.keyboard("{Enter}");
		expect(onSubmit).toHaveBeenCalledWith("hello");
		// Controlled mode delegates the post-submit clear to the consumer's setter.
		expect(onChange).toHaveBeenLastCalledWith("");
	});
});
