"use client";

import { Button, Toaster, toast } from "@hex-core/components";

/**
 * Sonner demo: Toaster portal + buttons triggering info / success / error /
 * action-button / promise toast variants.
 */
export function SonnerDemo() {
	return (
		<div className="flex flex-wrap gap-2">
			<Toaster position="bottom-right" richColors />
			<Button
				variant="outline"
				onClick={() =>
					toast("Event created", { description: "Friday, Dec 11 at 10:00 AM" })
				}
			>
				Show toast
			</Button>
			<Button variant="outline" onClick={() => toast.success("Profile saved")}>
				Success
			</Button>
			<Button variant="outline" onClick={() => toast.error("Failed to save")}>
				Error
			</Button>
			<Button
				variant="outline"
				onClick={() =>
					toast("Message archived", {
						description: "Moved to All mail",
						action: {
							label: "Undo",
							onClick: () => toast.success("Restored"),
						},
					})
				}
			>
				With action
			</Button>
			<Button
				variant="outline"
				onClick={() =>
					toast.promise(
						new Promise<void>((resolve, reject) =>
							setTimeout(() => (Math.random() > 0.5 ? resolve() : reject()), 1200),
						),
						{
							loading: "Saving changes…",
							success: "Saved",
							error: "Something went wrong",
						},
					)
				}
			>
				Promise
			</Button>
		</div>
	);
}
