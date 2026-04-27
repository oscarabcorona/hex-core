"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "../../components/ui";

/**
 * InputOTP patterns: 6-digit verification code with a center separator,
 * a 4-digit PIN variant, and a disabled-state example.
 */
export function InputOTPDemo() {
	const [value, setValue] = useState("");
	const [pin, setPin] = useState("");

	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					6-digit code (with separator)
				</p>
				<InputOTP
					maxLength={6}
					pattern={REGEXP_ONLY_DIGITS}
					value={value}
					onChange={setValue}
					aria-label="Six-digit verification code"
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
					</InputOTPGroup>
					<InputOTPSeparator />
					<InputOTPGroup>
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
				<p className="mt-2 text-sm text-muted-foreground">
					{value === ""
						? "Enter your one-time password."
						: `You entered: ${value}`}
				</p>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					4-digit PIN
				</p>
				<InputOTP
					maxLength={4}
					pattern={REGEXP_ONLY_DIGITS}
					value={pin}
					onChange={setPin}
					aria-label="Four-digit PIN"
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
						<InputOTPSlot index={3} />
					</InputOTPGroup>
				</InputOTP>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
				<InputOTP
					maxLength={6}
					disabled
					defaultValue="123456"
					aria-label="Disabled six-digit code"
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>
			</div>
		</div>
	);
}
