import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const avatarSchema: ComponentSchemaDefinition = {
	name: "avatar",
	displayName: "Avatar",
	description:
		"A user profile image with a fallback (usually initials) rendered when the image is missing or fails to load. Built on Radix UI Avatar — AvatarFallback accepts a delayMs prop to avoid flashing during fast loads.",
	category: "primitive",
	subcategory: "display",
	props: [{ name: "className", type: "string", required: false, description: "Additional CSS classes on the root" }],
	variants: [],
	slots: [
		{
			name: "children",
			description: "AvatarImage + AvatarFallback",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: ["@radix-ui/react-avatar", "clsx", "tailwind-merge"],
		internal: ["lib/utils"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["muted", "muted-foreground"],
	examples: [
		{
			title: "Basic avatar",
			description: "Image with initials fallback",
			code: '<Avatar>\n  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />\n  <AvatarFallback>CN</AvatarFallback>\n</Avatar>',
		},
	],
	ai: {
		whenToUse:
			"Use for user profile images: headers, comments, user lists. Always include AvatarFallback for accessibility and loading states.",
		whenNotToUse:
			"Don't use for decorative icons (use an <img> or icon component). Don't use for product/brand images (use <img> with proper sizing).",
		commonMistakes: [
			"Missing alt text on AvatarImage",
			"No AvatarFallback — shows nothing when image is missing or errors",
			"Omitting delayMs on AvatarFallback causes flicker for fast-loading images",
			"Using for non-circular images (override rounded-full if needed)",
		],
		relatedComponents: ["badge", "card"],
		accessibilityNotes:
			"AvatarImage requires alt text. AvatarFallback renders initials or an icon — ensure the visible text is meaningful.",
		tokenBudget: 433,
	},
	tags: ["avatar", "profile", "user", "image", "display"],
};
