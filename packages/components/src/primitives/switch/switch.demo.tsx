"use client";

import * as React from "react";
import { Label, Switch } from "@hex-core/components";

/**
 * Switch patterns: inline with label, settings-row (label left / switch right),
 * with description, checked by default, and disabled.
 */
export function SwitchDemo() {
	const [airplane, setAirplane] = React.useState(false);

	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Inline with label</p>
				<div className="flex items-center gap-2">
					<Switch id="airplane" checked={airplane} onCheckedChange={setAirplane} />
					<Label htmlFor="airplane">Airplane mode</Label>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Settings row (label left, switch right)
				</p>
				<div className="grid gap-3 rounded-md border p-4">
					<div className="flex items-center justify-between gap-4">
						<div className="grid gap-0.5">
							<Label htmlFor="wifi" className="leading-none">Wi-Fi</Label>
							<p className="text-xs text-muted-foreground">
								Automatically connect to known networks.
							</p>
						</div>
						<Switch id="wifi" defaultChecked />
					</div>
					<div className="flex items-center justify-between gap-4">
						<div className="grid gap-0.5">
							<Label htmlFor="bluetooth" className="leading-none">Bluetooth</Label>
							<p className="text-xs text-muted-foreground">
								Allow nearby devices to pair.
							</p>
						</div>
						<Switch id="bluetooth" />
					</div>
				</div>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
				<div className="grid gap-2">
					<div className="flex items-center gap-2">
						<Switch id="disabled-off" disabled />
						<Label htmlFor="disabled-off" className="text-muted-foreground">
							Disabled — off
						</Label>
					</div>
					<div className="flex items-center gap-2">
						<Switch id="disabled-on" disabled defaultChecked />
						<Label htmlFor="disabled-on" className="text-muted-foreground">
							Disabled — on
						</Label>
					</div>
				</div>
			</div>
		</div>
	);
}
