"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";
import { Button } from "../../primitives/button/button.js";
import { cn } from "../../lib/utils.js";

/**
 * Destructive-action confirmation gate. Wraps Radix AlertDialog with an
 * AI-aware shape: title, description, severity (info / warning /
 * danger), and a paired confirm / cancel callback. Severity gates the
 * confirm button's variant — `"danger"` flips it to the destructive
 * style so the user sees the weight of the action.
 *
 * Headless on data flow: `open` + `onOpenChange` make the consumer
 * own the visibility, otherwise an internal state machine kicks in
 * triggered by clicking the `trigger` slot.
 *
 * @example
 * <Confirmation
 *   trigger={<Button variant="destructive">Delete account</Button>}
 *   title="Delete your account?"
 *   description="This action cannot be undone. All conversations and tool history will be lost."
 *   severity="danger"
 *   confirmLabel="Delete"
 *   onConfirm={async () => deleteAccount()}
 * />
 */
export interface ConfirmationProps {
	/** The element that opens the dialog when clicked. Required when uncontrolled. */
	trigger?: React.ReactNode;
	/** Headline question / statement. */
	title: React.ReactNode;
	/** Optional secondary description. */
	description?: React.ReactNode;
	/** Severity of the action — drives the confirm-button variant. Defaults to `"warning"`. */
	severity?: ConfirmationSeverity;
	/** Override the confirm button label. Defaults to severity-appropriate text ("OK" / "Continue" / "Delete"). */
	confirmLabel?: React.ReactNode;
	/** Override the cancel button label. Defaults to "Cancel". */
	cancelLabel?: React.ReactNode;
	/** Called when the user confirms. May return a Promise — the button shows the busy state until it resolves. */
	onConfirm: () => void | Promise<void>;
	/** Called when the user cancels (or dismisses). */
	onCancel?: () => void;
	/** Controlled visibility. */
	open?: boolean;
	/** Visibility change handler — required when `open` is set. */
	onOpenChange?: (open: boolean) => void;
	/** Additional CSS classes on the dialog content panel. */
	className?: string;
}

/** Severity level — drives icon + confirm-button variant. */
export type ConfirmationSeverity = "info" | "warning" | "danger";

const SEVERITY_DEFAULTS: Record<
	ConfirmationSeverity,
	{ confirmLabel: string; buttonVariant: "default" | "destructive" }
> = {
	info: { confirmLabel: "OK", buttonVariant: "default" },
	warning: { confirmLabel: "Continue", buttonVariant: "default" },
	danger: { confirmLabel: "Delete", buttonVariant: "destructive" },
};

/**
 * Render a confirmation dialog with severity-driven styling.
 * @param props - The trigger, title, description, severity, callbacks.
 * @returns A controlled Radix AlertDialog wrapping the confirmation surface.
 */
function Confirmation({
	trigger,
	title,
	description,
	severity = "warning",
	confirmLabel,
	cancelLabel = "Cancel",
	onConfirm,
	onCancel,
	open: openProp,
	onOpenChange: onOpenChangeProp,
	className,
}: ConfirmationProps) {
	const defaults = SEVERITY_DEFAULTS[severity];
	const [isBusy, setIsBusy] = React.useState(false);
	// Standard controlled-with-fallback pattern: if `open` isn't supplied,
	// own the state internally so async-confirm + uncontrolled mode can
	// still close the dialog programmatically (M4).
	const [internalOpen, setInternalOpen] = React.useState(false);
	const isOpenControlled = openProp !== undefined;
	const open = isOpenControlled ? openProp : internalOpen;
	// Tracks "we just confirmed" so `handleOpenChange` doesn't misfire
	// `onCancel` when Radix auto-closes the dialog after a sync action.
	const wasConfirmedRef = React.useRef(false);

	function setOpen(next: boolean) {
		if (!isOpenControlled) setInternalOpen(next);
		onOpenChangeProp?.(next);
	}

	function handleOpenChange(next: boolean) {
		// Radix fires this on Escape, overlay click, AND button-driven close.
		// Cancel-style dismissals (anything that closes without going through
		// the confirm path) should fire `onCancel` so consumers can
		// distinguish from a confirmed action. Skip the cancel callback when
		// the close was preceded by a confirm (sync) or while async confirm
		// is in flight (busy spinner is the contract).
		if (!next) {
			if (!wasConfirmedRef.current && !isBusy) {
				onCancel?.();
			}
			wasConfirmedRef.current = false;
		}
		setOpen(next);
	}

	async function handleAction(event: React.MouseEvent<HTMLButtonElement>) {
		const result = onConfirm();
		if (result instanceof Promise) {
			// Async path: Radix would auto-close immediately. preventDefault
			// keeps the dialog open through the busy state; we close
			// programmatically on resolution.
			//
			// On rejection: skip past setOpen(false) so the dialog stays
			// open for the consumer to render a follow-up error UI / let
			// the user retry. The rejection is swallowed at this seam —
			// React's async event handlers don't surface to error
			// boundaries anyway, and bubbling an unhandled rejection adds
			// console noise without giving consumers anywhere to catch it.
			// Consumers who want toast / error UI should `try/catch`
			// inside `onConfirm` and handle the failure themselves.
			event.preventDefault();
			setIsBusy(true);
			try {
				await result;
				wasConfirmedRef.current = true;
				setOpen(false);
			} catch {
				// Intentionally swallowed — see comment above.
			} finally {
				setIsBusy(false);
			}
		} else {
			// Sync path: Radix auto-closes next, which fires handleOpenChange.
			// Mark confirmed so the cancel callback doesn't misfire on the
			// auto-close.
			wasConfirmedRef.current = true;
		}
	}

	return (
		<AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
			{trigger ? (
				<AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger>
			) : null}
			<AlertDialogPrimitive.Portal>
				<AlertDialogPrimitive.Overlay
					className={cn(
						"fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
						"data-[state=open]:animate-in data-[state=closed]:animate-out",
						"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
					)}
				/>
				<AlertDialogPrimitive.Content
					className={cn(
						"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
						"border border-foreground/[0.08] bg-background p-6 shadow-lg rounded-lg",
						"duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
						"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
						"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
						className,
					)}
				>
					<div className="flex flex-col gap-2 text-center sm:text-left">
						<div className="flex items-start gap-3">
							<SeverityIcon severity={severity} />
							<AlertDialogPrimitive.Title className="text-base font-semibold leading-tight text-foreground">
								{title}
							</AlertDialogPrimitive.Title>
						</div>
						{description ? (
							<AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
								{description}
							</AlertDialogPrimitive.Description>
						) : null}
					</div>
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						{/*
						 * The Cancel button only needs Radix's auto-close — onCancel is
						 * fired centrally in `handleOpenChange` so Escape / overlay
						 * dismissal also surface to the consumer. No onClick here.
						 */}
						<AlertDialogPrimitive.Cancel asChild>
							<Button variant="outline" disabled={isBusy}>
								{cancelLabel}
							</Button>
						</AlertDialogPrimitive.Cancel>
						<AlertDialogPrimitive.Action asChild>
							<Button
								variant={defaults.buttonVariant}
								onClick={handleAction}
								loading={isBusy}
							>
								{confirmLabel ?? defaults.confirmLabel}
							</Button>
						</AlertDialogPrimitive.Action>
					</div>
				</AlertDialogPrimitive.Content>
			</AlertDialogPrimitive.Portal>
		</AlertDialogPrimitive.Root>
	);
}

interface SeverityIconProps {
	severity: ConfirmationSeverity;
}

function SeverityIcon({ severity }: SeverityIconProps) {
	const cls =
		"mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full";
	if (severity === "danger") {
		return (
			<span aria-label="Danger" role="img" className={cn(cls, "bg-destructive/10 text-destructive")}>
				<TriangleIcon />
			</span>
		);
	}
	if (severity === "warning") {
		return (
			<span
				aria-label="Warning"
				role="img"
				className={cn(
					cls,
					"bg-[var(--color-warning,oklch(0.78_0.16_82))]/10 text-[var(--color-warning,oklch(0.78_0.16_82))]",
				)}
			>
				<TriangleIcon />
			</span>
		);
	}
	return (
		<span aria-label="Info" role="img" className={cn(cls, "bg-primary/10 text-primary")}>
			<InfoIcon />
		</span>
	);
}

function TriangleIcon() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M8 1.5L14.5 13.5H1.5L8 1.5z" />
			<path d="M8 6v3" />
			<circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
		</svg>
	);
}

function InfoIcon() {
	return (
		<svg
			aria-hidden
			viewBox="0 0 16 16"
			width="14"
			height="14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="8" cy="8" r="6.5" />
			<path d="M8 7v4" />
			<circle cx="8" cy="5" r="0.5" fill="currentColor" />
		</svg>
	);
}

export { Confirmation };
