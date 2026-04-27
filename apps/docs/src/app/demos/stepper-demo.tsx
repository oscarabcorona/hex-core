"use client";

import { useState } from "react";
import { Button, Stepper } from "../../components/ui";

const onboardingSteps = [
	{ id: "account", label: "Account", description: "Email + password" },
	{ id: "profile", label: "Profile", description: "Name + photo" },
	{ id: "confirm", label: "Confirm" },
];

const checkoutSteps = [
	{ id: "cart", label: "Cart" },
	{
		id: "shipping",
		label: "Shipping",
		status: "error" as const,
		description: "Address invalid",
	},
	{ id: "payment", label: "Payment" },
];

const settingsSteps = [
	{ id: "profile", label: "Profile" },
	{ id: "security", label: "Security" },
	{ id: "billing", label: "Billing" },
];

/**
 * Stepper demo: three variants — controllable horizontal wizard, error-state
 * checkout, and a vertical clickable settings stepper.
 */
export function StepperDemo() {
	const [current, setCurrent] = useState(1);
	const [verticalCurrent, setVerticalCurrent] = useState(1);

	return (
		<div className="flex flex-col gap-8">
			<div>
				<p className="mb-3 text-xs font-medium text-muted-foreground">
					Onboarding (controlled)
				</p>
				<Stepper
					aria-label="Onboarding"
					current={current}
					steps={onboardingSteps}
				/>
				<div className="mt-4 flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrent((c) => Math.max(0, c - 1))}
						disabled={current === 0}
					>
						Back
					</Button>
					<Button
						size="sm"
						onClick={() =>
							setCurrent((c) => Math.min(onboardingSteps.length - 1, c + 1))
						}
						disabled={current === onboardingSteps.length - 1}
					>
						Next
					</Button>
				</div>
			</div>

			<div>
				<p className="mb-3 text-xs font-medium text-muted-foreground">
					Checkout (with error)
				</p>
				<Stepper aria-label="Checkout" current={2} steps={checkoutSteps} />
			</div>

			<div className="max-w-xs">
				<p className="mb-3 text-xs font-medium text-muted-foreground">
					Settings (vertical, clickable)
				</p>
				<Stepper
					aria-label="Settings"
					orientation="vertical"
					current={verticalCurrent}
					onStepClick={setVerticalCurrent}
					steps={settingsSteps}
				/>
			</div>
		</div>
	);
}
