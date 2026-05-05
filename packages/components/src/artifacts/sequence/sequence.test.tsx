import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sequence, type SequenceActor, type SequenceMessage } from "./sequence.js";

const sampleActors: SequenceActor[] = [
	{ id: "user", label: "User" },
	{ id: "api", label: "API" },
	{ id: "db", label: "DB" },
];
const sampleMessages: SequenceMessage[] = [
	{ from: "user", to: "api", label: "POST /signup" },
	{ from: "api", to: "db", label: "INSERT user" },
	{ from: "db", to: "api", label: "ok", type: "return" },
	{ from: "api", to: "user", label: "201 Created", type: "return" },
];

describe("Sequence", () => {
	it("renders synchronously (no heavy peer)", () => {
		const { container } = render(<Sequence actors={sampleActors} messages={sampleMessages} />);
		expect(container.querySelector("[data-hex-sequence]")).not.toBeNull();
	});

	it("renders one actor header + lifeline per actor", () => {
		const { container } = render(<Sequence actors={sampleActors} messages={sampleMessages} />);
		expect(container.querySelectorAll("[data-hex-sequence-actor]").length).toBe(3);
		expect(container.querySelectorAll("[data-hex-sequence-lifeline]").length).toBe(3);
	});

	it("renders one message per declared message in chronological depth order", () => {
		const { container } = render(<Sequence actors={sampleActors} messages={sampleMessages} />);
		const depths = Array.from(container.querySelectorAll("[data-hex-sequence-message]")).map(
			(m) => m.getAttribute("data-depth"),
		);
		expect(depths).toEqual(["0", "1", "2", "3"]);
	});

	it("tags messages with their type (sync/async/return)", () => {
		const { container } = render(<Sequence actors={sampleActors} messages={sampleMessages} />);
		const types = Array.from(container.querySelectorAll("[data-hex-sequence-message]")).map(
			(m) => m.getAttribute("data-type"),
		);
		expect(types).toEqual(["sync", "sync", "return", "return"]);
	});

	it("silently skips messages whose from/to actor id is missing", () => {
		const orphaned: SequenceMessage[] = [
			{ from: "user", to: "api" },
			{ from: "ghost", to: "api" }, // skipped
			{ from: "api", to: "phantom" }, // skipped
		];
		const { container } = render(<Sequence actors={sampleActors} messages={orphaned} />);
		expect(container.querySelectorAll("[data-hex-sequence-message]").length).toBe(1);
	});

	it("renders self-call messages as loopback paths", () => {
		const selfCall: SequenceMessage[] = [{ from: "api", to: "api", label: "retry" }];
		const { container } = render(<Sequence actors={sampleActors} messages={selfCall} />);
		const msg = container.querySelector("[data-hex-sequence-message]");
		// Loopback path is rendered as a <path>; non-self uses <line>.
		expect(msg?.querySelector("path")).not.toBeNull();
	});

	it("calls onActorClick with the clicked actor", () => {
		const onActorClick = vi.fn();
		const { container } = render(
			<Sequence actors={sampleActors} messages={sampleMessages} onActorClick={onActorClick} />,
		);
		const firstActor = container.querySelector("[data-hex-sequence-actor]") as SVGGElement;
		firstActor.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onActorClick).toHaveBeenCalledTimes(1);
		expect(onActorClick.mock.calls[0][0].id).toBe("user");
	});

	it("calls onMessageClick with the clicked message", () => {
		const onMessageClick = vi.fn();
		const { container } = render(
			<Sequence actors={sampleActors} messages={sampleMessages} onMessageClick={onMessageClick} />,
		);
		const firstMessage = container.querySelector("[data-hex-sequence-message]") as SVGGElement;
		firstMessage.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		expect(onMessageClick).toHaveBeenCalledTimes(1);
		expect(onMessageClick.mock.calls[0][0].label).toBe("POST /signup");
	});

	it("activates handlers via keyboard (Enter and Space)", () => {
		const onActorClick = vi.fn();
		const onMessageClick = vi.fn();
		const { container } = render(
			<Sequence
				actors={sampleActors}
				messages={sampleMessages}
				onActorClick={onActorClick}
				onMessageClick={onMessageClick}
			/>,
		);
		const firstActor = container.querySelector("[data-hex-sequence-actor]") as SVGGElement;
		expect(firstActor.getAttribute("tabindex")).toBe("0");
		fireEvent.keyDown(firstActor, { key: "Enter" });
		expect(onActorClick).toHaveBeenCalledTimes(1);
		const firstMessage = container.querySelector("[data-hex-sequence-message]") as SVGGElement;
		fireEvent.keyDown(firstMessage, { key: " " });
		expect(onMessageClick).toHaveBeenCalledTimes(1);
	});

	it("declares role=img + non-empty title and desc for screen readers", () => {
		const { container } = render(<Sequence actors={sampleActors} messages={sampleMessages} />);
		const svg = container.querySelector("[data-hex-sequence]") as SVGSVGElement;
		expect(svg.getAttribute("role")).toBe("img");
		expect(svg.querySelector("title")?.textContent?.length ?? 0).toBeGreaterThan(0);
		expect(svg.querySelector("desc")?.textContent ?? "").toContain("3 actors");
	});

	it("merges className onto the SVG", () => {
		const { container } = render(
			<Sequence actors={sampleActors} messages={sampleMessages} className="custom-sq" />,
		);
		expect(container.querySelector("[data-hex-sequence]")?.getAttribute("class")).toContain(
			"custom-sq",
		);
	});

	it("renders nothing for an empty actors array", () => {
		const { container } = render(<Sequence actors={[]} messages={[]} />);
		expect(container.querySelectorAll("[data-hex-sequence-actor]").length).toBe(0);
	});

	it("renders a single-actor sequence with self-call without crashing", () => {
		const oneActor: SequenceActor[] = [{ id: "worker", label: "Worker" }];
		const selfMsg: SequenceMessage[] = [{ from: "worker", to: "worker", label: "retry" }];
		const { container } = render(<Sequence actors={oneActor} messages={selfMsg} />);
		expect(container.querySelectorAll("[data-hex-sequence-actor]").length).toBe(1);
		expect(container.querySelectorAll("[data-hex-sequence-message]").length).toBe(1);
	});

	it("scales self-call drop with messageGap so the loopback doesn't overflow", () => {
		const selfMsg: SequenceMessage[] = [{ from: "api", to: "api", label: "retry" }];
		const { container } = render(
			<Sequence actors={sampleActors} messages={selfMsg} messageGap={20} />,
		);
		const path = container.querySelector("[data-hex-sequence-message] path");
		// At messageGap=20, drop = max(6, 20*0.4) = 8 (less than the default 14).
		expect(path?.getAttribute("d")).toMatch(/L\d+,\d+ L\d+,\d+ L\d+,\d+/);
	});

	it("anchors self-call message labels to the right of the loopback (start-anchored)", () => {
		const selfMsg: SequenceMessage[] = [{ from: "api", to: "api", label: "retry" }];
		const { container } = render(<Sequence actors={sampleActors} messages={selfMsg} />);
		const text = container.querySelector("[data-hex-sequence-message] text");
		expect(text?.getAttribute("text-anchor")).toBe("start");
	});

	it("calls preventDefault on Space activation for both actor and message", () => {
		const onActorClick = vi.fn();
		const onMessageClick = vi.fn();
		const { container } = render(
			<Sequence
				actors={sampleActors}
				messages={sampleMessages}
				onActorClick={onActorClick}
				onMessageClick={onMessageClick}
			/>,
		);
		const firstActor = container.querySelector("[data-hex-sequence-actor]") as SVGGElement;
		const actorEvent = new KeyboardEvent("keydown", {
			key: " ",
			bubbles: true,
			cancelable: true,
		});
		firstActor.dispatchEvent(actorEvent);
		expect(actorEvent.defaultPrevented).toBe(true);

		const firstMessage = container.querySelector("[data-hex-sequence-message]") as SVGGElement;
		const msgEvent = new KeyboardEvent("keydown", {
			key: " ",
			bubbles: true,
			cancelable: true,
		});
		firstMessage.dispatchEvent(msgEvent);
		expect(msgEvent.defaultPrevented).toBe(true);
	});
});
