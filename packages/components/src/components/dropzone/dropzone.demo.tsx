"use client";

import { useState } from "react";
import { Dropzone } from "@hex-core/components";

/**
 * Dropzone demo: three variants — basic image-only with size cap, render-prop
 * custom body, and a disabled state.
 */
export function DropzoneDemo() {
	const [files, setFiles] = useState<File[]>([]);

	return (
		<div className="flex flex-col gap-6">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Image upload (max 5MB)
				</p>
				<Dropzone
					accept="image/*"
					maxSize={5 * 1024 * 1024}
					onFilesSelected={(picked) =>
						setFiles((prev) => [...prev, ...picked])
					}
					aria-label="Upload images"
				/>
				{files.length > 0 ? (
					<ul className="mt-2 text-xs text-muted-foreground">
						{files.map((f, i) => (
							<li key={`${f.name}-${i}`}>
								{f.name} ({Math.round(f.size / 1024)} KB)
							</li>
						))}
					</ul>
				) : null}
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Custom render
				</p>
				<Dropzone
					aria-label="Custom upload"
					onFilesSelected={() => {}}
					className="min-h-32"
				>
					{({ isDragOver }) => (
						<span className="text-sm font-medium">
							{isDragOver
								? "Drop now to attach"
								: "Pull a file in or click to browse"}
						</span>
					)}
				</Dropzone>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Disabled
				</p>
				<Dropzone disabled aria-label="Disabled upload" />
			</div>
		</div>
	);
}
