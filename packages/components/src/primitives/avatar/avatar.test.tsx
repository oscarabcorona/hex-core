import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar.js";

describe("Avatar", () => {
	it("renders the fallback when no image is loaded", () => {
		render(
			<Avatar>
				<AvatarImage src="" alt="" />
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>,
		);
		// Radix renders the fallback synchronously when no src loads in jsdom.
		expect(screen.getByText("JD")).toBeInTheDocument();
	});

	it("merges consumer className on the root", () => {
		render(
			<Avatar className="custom-class" data-testid="avatar-root">
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>,
		);
		const root = screen.getByTestId("avatar-root");
		expect(root).toHaveClass("custom-class");
		expect(root).toHaveClass("rounded-full");
	});

	it("forwards Avatar ref to the root span element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLSpanElement | null>;
		render(
			<Avatar ref={ref}>
				<AvatarFallback>x</AvatarFallback>
			</Avatar>,
		);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("forwards AvatarFallback ref to its span element", () => {
		const ref = { current: null } as React.MutableRefObject<HTMLSpanElement | null>;
		render(
			<Avatar>
				<AvatarFallback ref={ref}>x</AvatarFallback>
			</Avatar>,
		);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});
});
