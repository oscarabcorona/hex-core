"use client";

import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";
import { cn } from "../../lib/utils.js";

/** Props for the root InputOTP component (mirrors input-otp's OTPInput). */
type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput>;

/** Root OTP input. Wraps input-otp's OTPInput and exposes slot context to children. */
const InputOTP = React.forwardRef<React.ComponentRef<typeof OTPInput>, InputOTPProps>(
	({ className, containerClassName, ...props }, ref) => (
	<OTPInput
		ref={ref}
		containerClassName={cn(
			"flex items-center gap-[var(--gap-sm,0.5rem)] has-[:disabled]:opacity-50",
			containerClassName,
		)}
		className={cn("disabled:cursor-not-allowed", className)}
		{...props}
	/>
));
InputOTP.displayName = "InputOTP";

/** Groups slots together; place between runs of slots to add visual dividers. */
const InputOTPGroup = React.forwardRef<
	React.ComponentRef<"div">,
	React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

interface InputOTPSlotProps extends React.ComponentPropsWithoutRef<"div"> {
	/** Index of the slot in the underlying OTP value. */
	index: number;
}

/** A single character slot. Reads its state from OTPInputContext. */
const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
	({ index, className, ...props }, ref) => {
		const inputOTPContext = React.useContext(OTPInputContext);
		const slot = inputOTPContext.slots[index];
		const char = slot?.char ?? null;
		const hasFakeCaret = slot?.hasFakeCaret ?? false;
		const isActive = slot?.isActive ?? false;

		return (
			<div
				ref={ref}
				className={cn(
					"relative flex h-[var(--control-height-md,2.5rem)] w-[var(--control-height-md,2.5rem)] items-center justify-center border-y border-r border-input text-sm transition-all duration-[var(--duration-normal,200ms)] ease-out",
					"inset-ring-1 inset-ring-foreground/[0.06]",
					"first:rounded-l-md first:border-l last:rounded-r-md",
					isActive && "z-10 ring-2 ring-ring ring-offset-2 ring-offset-background",
					className,
				)}
				{...props}
			>
				{char}
				{hasFakeCaret && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="h-4 w-px animate-pulse bg-foreground duration-1000" />
					</div>
				)}
			</div>
		);
	},
);
InputOTPSlot.displayName = "InputOTPSlot";

/** Visual separator between slot groups (a bullet by default). */
const InputOTPSeparator = React.forwardRef<
	React.ComponentRef<"div">,
	React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
	<div ref={ref} role="separator" {...props}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="h-2 w-2 text-muted-foreground"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="6" />
		</svg>
	</div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
export type { InputOTPProps };
