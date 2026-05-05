"use client";

import * as React from "react";
import { cn } from "../../lib/utils.js";

/**
 * UML-style sequence diagram. Actors render as columns with vertical
 * lifelines; messages render as horizontal arrows between actors,
 * stacked top-to-bottom in declaration order. Pure SVG; no heavy peer
 * dependency.
 *
 * Distinct from Flowchart (DAG of steps) and TimeAxis (events on a
 * time axis): Sequence encodes WHO talks to WHO and IN WHAT ORDER.
 *
 * @example
 * <Sequence
 *   actors={[
 *     { id: "user", label: "User" },
 *     { id: "api", label: "API" },
 *     { id: "db", label: "DB" },
 *   ]}
 *   messages={[
 *     { from: "user", to: "api", label: "POST /signup" },
 *     { from: "api", to: "db", label: "INSERT user" },
 *     { from: "db", to: "api", label: "ok", type: "return" },
 *     { from: "api", to: "user", label: "201 Created", type: "return" },
 *   ]}
 * />
 */
export type SequenceActor = {
	id: string;
	label: string;
};

export type SequenceMessage = {
	from: string;
	to: string;
	label?: string;
	/** "sync" (default) draws a solid arrow; "async" draws a thinner half-head; "return" is dashed. */
	type?: "sync" | "async" | "return";
};

export interface SequenceProps extends Omit<React.SVGAttributes<SVGSVGElement>, "children"> {
	/** Actors in display order (columns left-to-right). */
	actors: SequenceActor[];
	/** Messages in chronological order (top-to-bottom). */
	messages: SequenceMessage[];
	/** Pixel width of the rendered SVG. Default 720. */
	width?: number;
	/** Pixel height of each actor header. Default 40. */
	headerHeight?: number;
	/** Pixel vertical gap between consecutive messages. Default 36. */
	messageGap?: number;
	/** Fired when an actor header is clicked. */
	onActorClick?: (actor: SequenceActor) => void;
	/** Fired when a message arrow is clicked. */
	onMessageClick?: (message: SequenceMessage) => void;
}

interface ActorPos {
	actor: SequenceActor;
	x: number;
	depth: number;
}

interface LaidOutMessage {
	message: SequenceMessage;
	from: ActorPos;
	to: ActorPos;
	y: number;
	depth: number;
	isSelfCall: boolean;
}

const HEADER_PADDING = 16;
const MESSAGE_TOP_PADDING = 24;

function Sequence({
	actors,
	messages,
	width = 720,
	headerHeight = 40,
	messageGap = 36,
	onActorClick,
	onMessageClick,
	className,
	...rest
}: SequenceProps) {
	const laidOut = React.useMemo(
		() => layout(actors, messages, width, headerHeight, messageGap),
		[actors, messages, width, headerHeight, messageGap],
	);

	const desc = `Sequence diagram with ${actors.length} actor${actors.length === 1 ? "" : "s"} and ${messages.length} message${messages.length === 1 ? "" : "s"}`;
	// Per-instance to avoid <defs> id collision when two <Sequence> mount on
	// the same page; React.useId() is unique per component instance.
	const arrowId = React.useId().replace(/:/g, "-");
	// Loopback height scales with messageGap so the self-call doesn't
	// overflow into the next message at small messageGap values.
	const SELF_CALL_DROP = Math.min(14, Math.max(6, messageGap * 0.4));
	const SELF_CALL_OUT = 28;

	return (
		<svg
			{...rest}
			data-hex-sequence
			role="img"
			width={width}
			height={laidOut.totalHeight}
			viewBox={`0 0 ${width} ${laidOut.totalHeight}`}
			className={cn("block", className)}
		>
			<title>Sequence diagram</title>
			<desc>{desc}</desc>
			<defs>
				<marker
					id={`hex-sequence-arrow-${arrowId}`}
					viewBox="0 0 10 10"
					refX="10"
					refY="5"
					markerWidth="6"
					markerHeight="6"
					orient="auto-start-reverse"
				>
					<path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--foreground))" />
				</marker>
			</defs>
			{/* Lifelines */}
			<g data-hex-sequence-lifelines>
				{laidOut.actors.map((a) => (
					<line
						key={`lifeline-${a.actor.id}`}
						data-hex-sequence-lifeline
						x1={a.x}
						x2={a.x}
						y1={headerHeight}
						y2={laidOut.totalHeight - 8}
						stroke="hsl(var(--muted-foreground))"
						strokeOpacity={0.7}
						strokeDasharray="3 4"
						strokeWidth={1}
					/>
				))}
			</g>
			{/* Actor headers */}
			<g data-hex-sequence-actors>
				{laidOut.actors.map((a) => {
					const interactive = Boolean(onActorClick);
					const handleActivate = () => onActorClick?.(a.actor);
					return (
						<g
							key={a.actor.id}
							data-hex-sequence-actor
							data-depth={a.depth}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={interactive ? a.actor.label : undefined}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							<rect
								x={a.x - 64}
								y={4}
								width={128}
								height={headerHeight - 8}
								rx={4}
								ry={4}
								fill="hsl(var(--card))"
								stroke="hsl(var(--border))"
								strokeWidth={1}
							/>
							<text
								x={a.x}
								y={headerHeight / 2}
								dy="0.35em"
								textAnchor="middle"
								fontSize={12}
								fontWeight={600}
								fill="hsl(var(--foreground))"
								style={{ pointerEvents: "none" }}
							>
								{a.actor.label}
							</text>
						</g>
					);
				})}
			</g>
			{/* Messages */}
			<g data-hex-sequence-messages>
				{laidOut.messages.map((m, i) => {
					const interactive = Boolean(onMessageClick);
					const handleActivate = () => onMessageClick?.(m.message);
					const stroke = "hsl(var(--foreground))";
					const dashed = m.message.type === "return" ? "4 3" : undefined;
					const strokeWidth = m.message.type === "async" ? 1 : 1.25;
					return (
						<g
							key={`${m.message.from}-${m.message.to}-${i}`}
							data-hex-sequence-message
							data-depth={m.depth}
							data-type={m.message.type ?? "sync"}
							role={interactive ? "button" : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-label={
								interactive
									? `Message ${i + 1}: from ${m.from.actor.label} to ${m.to.actor.label}${m.message.label ? `, "${m.message.label}"` : ""}`
									: undefined
							}
							style={interactive ? { cursor: "pointer" } : undefined}
							onClick={interactive ? handleActivate : undefined}
							onKeyDown={interactive ? (e) => activateOnKey(e, handleActivate) : undefined}
						>
							{m.isSelfCall ? (
								// Loopback: out + down + back. Drop scales with messageGap.
								<path
									d={`M${m.from.x},${m.y} L${m.from.x + SELF_CALL_OUT},${m.y} L${m.from.x + SELF_CALL_OUT},${m.y + SELF_CALL_DROP} L${m.from.x + 4},${m.y + SELF_CALL_DROP}`}
									fill="none"
									stroke={stroke}
									strokeWidth={strokeWidth}
									strokeDasharray={dashed}
									markerEnd={`url(#hex-sequence-arrow-${arrowId})`}
								/>
							) : (
								<line
									x1={m.from.x}
									x2={m.to.x}
									y1={m.y}
									y2={m.y}
									stroke={stroke}
									strokeWidth={strokeWidth}
									strokeDasharray={dashed}
									markerEnd={`url(#hex-sequence-arrow-${arrowId})`}
								/>
							)}
							{m.message.label ? (
								<text
									// Self-calls anchor the label right of the loopback's apex
									// (start-anchored, just past the outbound segment) so it
									// doesn't sit above the actor's own lifeline. Non-self
									// messages center the label between the two actors.
									x={m.isSelfCall ? m.from.x + SELF_CALL_OUT + 4 : (m.from.x + m.to.x) / 2}
									y={m.y - 4}
									textAnchor={m.isSelfCall ? "start" : "middle"}
									fontSize={11}
									fill="hsl(var(--foreground))"
									style={{
										paintOrder: "stroke",
										pointerEvents: "none",
									}}
									stroke="hsl(var(--background))"
									strokeWidth={3}
									strokeLinejoin="round"
								>
									{m.message.label}
								</text>
							) : null}
						</g>
					);
				})}
			</g>
		</svg>
	);
}

function layout(
	actors: SequenceActor[],
	messages: SequenceMessage[],
	width: number,
	headerHeight: number,
	messageGap: number,
): {
	actors: ActorPos[];
	messages: LaidOutMessage[];
	totalHeight: number;
} {
	if (actors.length === 0) {
		return { actors: [], messages: [], totalHeight: headerHeight + 16 };
	}

	const usableWidth = width - HEADER_PADDING * 2;
	const colStep = actors.length > 1 ? usableWidth / (actors.length - 1) : 0;
	const actorPositions: ActorPos[] = actors.map((a, i) => ({
		actor: a,
		x: HEADER_PADDING + colStep * i,
		depth: i,
	}));
	const byId = new Map(actorPositions.map((a) => [a.actor.id, a]));

	const laidOutMessages: LaidOutMessage[] = messages
		.map((message, i) => {
			const from = byId.get(message.from);
			const to = byId.get(message.to);
			if (!from || !to) return null;
			return {
				message,
				from,
				to,
				y: headerHeight + MESSAGE_TOP_PADDING + i * messageGap,
				depth: i,
				isSelfCall: message.from === message.to,
			};
		})
		.filter((m): m is LaidOutMessage => m !== null);

	const totalHeight =
		headerHeight +
		MESSAGE_TOP_PADDING +
		Math.max(0, laidOutMessages.length - 1) * messageGap +
		32;

	return { actors: actorPositions, messages: laidOutMessages, totalHeight };
}

function activateOnKey(e: React.KeyboardEvent, fn: () => void): void {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

export { Sequence };
