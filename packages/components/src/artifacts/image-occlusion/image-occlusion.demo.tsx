import { ImageOcclusion } from "@hex-core/components";

/** ImageOcclusion demo: hides three labelled regions over a globe icon for click-to-reveal. */
export function ImageOcclusionDemo() {
	return (
		<div className="w-full max-w-md">
			<ImageOcclusion
				src="/globe.svg"
				alt="A simple globe icon — practice locating its labelled regions"
				regions={[
					{ id: "north", x: 0.35, y: 0.1, width: 0.3, height: 0.18, label: "Northern hemisphere" },
					{ id: "equator", x: 0.15, y: 0.45, width: 0.7, height: 0.1, label: "Equator" },
					{ id: "south", x: 0.35, y: 0.72, width: 0.3, height: 0.18, label: "Southern hemisphere" },
				]}
			/>
		</div>
	);
}
