"use client";

import * as React from "react";
import { Slider } from "../../components/ui";

/**
 * Slider patterns: single-thumb with live readout, range (two thumbs),
 * stepped, vertical orientation, and disabled.
 */
export function SliderDemo() {
	const [volume, setVolume] = React.useState([33]);
	const [range, setRange] = React.useState([20, 80]);

	return (
		<div className="grid w-full max-w-md gap-6">
			<div>
				<div className="mb-2 flex items-center justify-between text-xs">
					<span className="font-medium text-muted-foreground">Volume</span>
					<span className="text-muted-foreground">{volume[0]}%</span>
				</div>
				<Slider
					aria-label="Volume"
					value={volume}
					onValueChange={setVolume}
					max={100}
					step={1}
				/>
			</div>

			<div>
				<div className="mb-2 flex items-center justify-between text-xs">
					<span className="font-medium text-muted-foreground">Price range</span>
					<span className="text-muted-foreground">
						${range[0]} – ${range[1]}
					</span>
				</div>
				<Slider
					aria-label="Price range"
					thumbLabels={["Minimum price", "Maximum price"]}
					value={range}
					onValueChange={setRange}
					min={0}
					max={100}
					step={5}
				/>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Stepped (step = 10)
				</p>
				<Slider aria-label="Stepped" defaultValue={[40]} max={100} step={10} />
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Disabled</p>
				<Slider aria-label="Disabled" defaultValue={[50]} max={100} disabled />
			</div>
		</div>
	);
}
