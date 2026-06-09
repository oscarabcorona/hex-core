import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const dropzoneSchema: ComponentSchemaDefinition = {
	name: "dropzone",
	displayName: "Dropzone",
	description:
		"Drag-and-drop file input built on the native HTML5 drag-drop API plus a visually-hidden <input type='file'> for keyboard + screen-reader access. Filters by accept/maxSize/maxFiles before emitting.",
	category: "component",
	subcategory: "input",
	props: [
		{
			name: "onFilesSelected",
			type: "function",
			required: false,
			description: "Callback fired with the accepted File[] on pick or drop.",
		},
		{
			name: "onFilesRejected",
			type: "function",
			required: false,
			description:
				"Callback fired with the rejected File[] when files fail accept/maxSize/maxFiles, OR when multiple={false} and extras were sliced off. Receives the rejected File[]. Use to surface 'wrong type' / 'too large' toasts.",
		},
		{
			name: "accept",
			type: "string",
			required: false,
			description:
				"Accept attribute forwarded to the hidden file input. Three forms: MIME type ('application/pdf'), MIME wildcard ('image/*'), or extension with leading dot ('.csv'). Extension matching is suffix-based (mirrors HTML5) — '.csv' will match 'notes.md.csv' as well.",
		},
		{
			name: "multiple",
			type: "boolean",
			required: false,
			default: true,
			description:
				"Allow multiple files. With `multiple={false}`, the first accepted file flows to onFilesSelected and any extras flow to onFilesRejected so consumers can toast them.",
		},
		{
			name: "maxFiles",
			type: "number",
			required: false,
			description:
				"Cap on the number of accepted files. Excess files are dropped silently — surface in your handler if needed.",
		},
		{
			name: "maxSize",
			type: "number",
			required: false,
			description:
				"Maximum size per file in bytes. Files over the cap are filtered before onFilesSelected fires.",
		},
		{
			name: "disabled",
			type: "boolean",
			required: false,
			default: false,
			description: "Disable interaction (click + drop + keyboard).",
		},
		{
			name: "children",
			type: "object",
			required: false,
			description:
				"Render override for the body. Pass a node, or a function receiving { isDragOver, isDisabled, openFileDialog } for layout control.",
		},
		{
			name: "aria-label",
			type: "string",
			required: true,
			description: "Required accessible name for the drop area.",
		},
	],
	variants: [],
	slots: [
		{
			name: "children",
			description:
				"Body of the drop area (icon + copy). Optional — sensible default included.",
			required: false,
			acceptedTypes: ["ReactNode", "function"],
		},
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: [
		"background",
		"input",
		"primary",
		"accent",
		"accent-foreground",
		"muted-foreground",
		"ring",
	],
	examples: [
		{
			title: "Image upload",
			description: "Filter to images only with a 5MB cap",
			code: 'import { useState } from "react";\nimport { Dropzone } from "@/components/ui/dropzone";\n\nexport function Example() {\n  const [files, setFiles] = useState<File[]>([]);\n  return (\n    <>\n      <Dropzone\n        accept="image/*"\n        maxSize={5 * 1024 * 1024}\n        onFilesSelected={(picked) => setFiles((f) => [...f, ...picked])}\n        aria-label="Upload images"\n      />\n      <ul>{files.map((f) => <li key={f.name}>{f.name}</li>)}</ul>\n    </>\n  );\n}',
		},
		{
			title: "Custom body via render prop",
			description: "Take full control of the drop area visuals",
			code: 'import { Dropzone } from "@/components/ui/dropzone";\n\nexport function Example() {\n  return (\n    <Dropzone aria-label="Upload" onFilesSelected={(f) => console.log(f)}>\n      {({ isDragOver }) => (\n        <span>{isDragOver ? "Release to upload" : "Drop a file or click"}</span>\n      )}\n    </Dropzone>\n  );\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for any file upload UX where drag-drop is helpful (image uploaders, CSV import, attachment pickers). Built on native HTML5 + a hidden <input type='file'> so keyboard and screen-reader users get the same affordance.",
		whenNotToUse:
			"Don't use for camera/microphone capture (use <input type='file' capture> directly or a media-specific component). Don't use for chunked/resumable uploads — Dropzone only emits File[]; pair with a real upload pipeline (tus, S3 multipart). Don't use for clipboard paste image upload — listen on document for that.",
		commonMistakes: [
			"Forgetting aria-label — without it the drop area is announced as just 'button' to screen readers",
			"Setting accept='image' (missing the slash or wildcard) — must be a MIME type, MIME prefix with /*, or a .extension",
			"Forgetting that extension matching is suffix-based — '.csv' will match 'notes.md.csv'. Acceptable (mirrors HTML5) but document upstream if business logic requires strict suffix-only",
			"Treating maxFiles as enforcement — files past the cap are dropped silently; if business rules require it, validate again on submit",
			"Forgetting to clear the file input value after a successful upload — Dropzone resets the hidden input automatically; if you wrap it, do the same",
			"Calling preventDefault on parent containers' onDragOver — without it the browser opens the file when dropped on the window outside the dropzone",
			"Treating empty drops as no-op silently when the user expected feedback — pair with onFilesRejected to surface filter failures",
		],
		relatedComponents: ["input", "button", "card"],
		accessibilityNotes:
			"The drop area is a role='button' div with tabIndex=0 and the required aria-label; Enter and Space open the file dialog. The file input is visually-hidden but live in the DOM so keyboard focus + assistive-tech file pickers work. Drag-state is exposed via data-drag-over for CSS-only state styling. When disabled, the drop area is removed from the tab order and aria-disabled is set.",
		tokenBudget: 1466,
	},
	tags: ["dropzone", "file-upload", "drag-drop", "input"],
};
