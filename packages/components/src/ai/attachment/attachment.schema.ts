import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const attachmentSchema: ComponentSchemaDefinition = {
	name: "attachment",
	displayName: "Attachment",
	description:
		"File / image thumbnail with optional remove affordance + upload-progress overlay. Composes with the AI Composer for multimodal message drafts. Auto-detects image vs file variant from MIME type + preview URL.",
	category: "ai",
	subcategory: "input",
	props: [
		{
			name: "file",
			type: "object",
			required: true,
			description: "Native File OR { name, size, type, preview? } metadata. Drives variant auto-detection (image+preview → thumbnail; else file icon + name + size).",
		},
		{
			name: "onRemove",
			type: "function",
			required: false,
			description: "Click handler for the × overlay button. Signature: () => void.",
		},
		{
			name: "progress",
			type: "number",
			required: false,
			description: "Upload progress in [0, 1). Values >= 1 (or undefined) hide the progressbar — pass undefined once the upload completes. Internally scaled to 0–100 for aria-valuenow so AT announces 'NN percent.'",
		},
		{
			name: "variant",
			type: "enum",
			required: false,
			description: "Override the auto-detected variant. 'image' renders a thumbnail; 'file' renders icon + name + size.",
			enumValues: ["file", "image"],
		},
		{ name: "className", type: "string", required: false, description: "Additional CSS classes" },
	],
	variants: [
		{
			name: "variant",
			description: "Visual layout. Auto-detected unless overridden.",
			values: [
				{
					value: "file",
					description: "Generic file icon + name + size. Bordered card with horizontal padding.",
					useWhen: "the attachment is a non-image (PDF, code, archive, audio) OR an image without a preview URL",
				},
				{
					value: "image",
					description: "80×80 thumbnail of the preview URL. Zero padding so the image fills the card.",
					useWhen: "the attachment is an image AND a preview URL is available (use URL.createObjectURL on the File before passing in)",
				},
			],
			default: "file",
		},
	],
	slots: [],
	dependencies: {
		npm: ["class-variance-authority", "clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["card", "border", "foreground", "muted", "muted-foreground", "primary", "accent", "ring"],
	examples: [
		{
			title: "Image preview in composer",
			description: "Image attachment with remove affordance",
			code: 'function ComposerWithImage() {\n  const [file, setFile] = React.useState<File | null>(null);\n  const preview = file ? URL.createObjectURL(file) : null;\n  return (\n    <Composer>\n      {file && preview ? (\n        <Attachment\n          file={{ name: file.name, size: file.size, type: file.type, preview }}\n          onRemove={() => setFile(null)}\n        />\n      ) : null}\n      {/* …textarea + send button… */}\n    </Composer>\n  );\n}',
			composition: ["composer", "ai", "image", "removable"],
		},
		{
			title: "Upload progress",
			description: "File attachment with live progress overlay",
			code: '<Attachment\n  file={{ name: "report.pdf", size: 2_400_000, type: "application/pdf" }}\n  progress={uploadProgress}\n  onRemove={() => cancelUpload()}\n/>',
			composition: ["upload", "progress", "removable"],
		},
		{
			title: "Static file preview (no remove)",
			description: "Read-only attachment in a sent message",
			code: '<Attachment file={{ name: "diagram.svg", size: 18000, type: "image/svg+xml" }} />',
			composition: ["read-only", "message"],
		},
	],
	ai: {
		whenToUse:
			"Use inside a Composer to show pending attachments the user can remove before sending, or inside a Message to show attached files in a sent turn. Pair native File objects with URL.createObjectURL(file) before rendering — the component doesn't manage object URLs.",
		whenNotToUse:
			"Don't use for the upload-target affordance itself (that's Dropzone — it handles drag-drop + click-to-pick). Don't use for static document previews outside a chat composer (use Card with a file icon). Don't use for inline images in markdown — use Markdown's image rendering.",
		commonMistakes: [
			"Forgetting URL.createObjectURL on a native File — preview won't render and the variant falls back to file",
			"Not revoking object URLs when the attachment is removed — leaks memory",
			"Using Attachment without onRemove inside a Composer — leaves the user unable to remove",
		],
		antiPatterns: [
			{
				mistake: "Using Attachment as the upload-input affordance (drag-drop area, click-to-pick)",
				insteadUse: "dropzone",
				why: "Dropzone is purpose-built for the upload-target — drag/drop semantics, click-to-pick, accept-MIME validation. Attachment SHOWS the result; Dropzone is the input.",
			},
			{
				mistake: "Using Attachment for static document previews on a profile / details page",
				insteadUse: "card",
				why: "Card is the static-content surface. Attachment ships remove + progress overlays consumers don't need outside the chat-composer flow.",
			},
			{
				mistake: "Using Attachment to render an inline image inside markdown body text",
				insteadUse: "markdown",
				why: "Markdown's `![alt](url)` already renders an inline image with the right semantics. Attachment is for the discrete-attachment-token UX (with name, size, remove); markdown handles inline media.",
			},
		],
		relatedComponents: ["composer", "dropzone", "message", "message-list"],
		accessibilityNotes:
			"Image variant uses <img alt> from the file name. Remove button gets aria-label='Remove ${name}'. Progress overlay is role='progressbar' with aria-valuemin=0 / aria-valuemax=100 / aria-valuenow=Math.round(progress * 100) and a generic 'Uploading ${name}' aria-label — AT announces 'NN percent.'",
		tokenBudget: 1428,
	},
	tags: ["attachment", "ai", "composer", "file", "image", "upload", "multimodal"],
};
