import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const marketingTeamSchema: ComponentSchemaDefinition = {
	name: "marketing-team",
	displayName: "MarketingTeam",
	description:
		"A team section: an optional heading block above a grid of member cards (avatar, name, role, optional bio + social links). Avatars and social links are ReactNode slots — no icon set is bundled. Presentational and theme-driven.",
	category: "block",
	subcategory: "marketing",
	props: [
		{
			name: "members",
			type: "object",
			required: true,
			description:
				"ReadonlyArray<{ name; role; avatar?; bio?; social? }>. Team members in display order. Avatar is a ReactNode (Avatar / img) — none is bundled.",
		},
		{ name: "eyebrow", type: "ReactNode", required: false, description: "Section eyebrow above the title." },
		{ name: "title", type: "ReactNode", required: false, description: "Section heading." },
		{ name: "description", type: "ReactNode", required: false, description: "Section subcopy below the heading." },
		{
			name: "columns",
			type: "enum",
			required: false,
			default: "three",
			description: "Cards per row on ≥lg: 'three' or 'four'.",
		},
		{ name: "className", type: "string", required: false, description: "Additional classes applied to the root <section>." },
	],
	variants: [
		{
			name: "columns",
			description: "Cards per row on desktop.",
			default: "three",
			values: [
				{ value: "three", description: "Three across.", useWhen: "Standard team grid, room for bios." },
				{ value: "four", description: "Four across.", useWhen: "Larger team where each card is just name + role." },
			],
		},
	],
	slots: [
		{ name: "members[].avatar", description: "Member avatar.", required: false, acceptedTypes: ["ReactNode"] },
		{ name: "members[].social", description: "Per-member social-link icons.", required: false, acceptedTypes: ["ReactNode"] },
	],
	dependencies: {
		npm: ["clsx", "tailwind-merge"],
		internal: [],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["background", "foreground", "muted-foreground", "primary"],
	examples: [
		{
			title: "Three team members with avatars",
			description: "Heading block above three cards with avatar, name, role, and bio.",
			code: `import { MarketingTeam, Avatar, AvatarImage, AvatarFallback } from "@hex-core/components";

<MarketingTeam
  title="Meet the team"
  description="The people building Hex."
  members={[
    {
      name: "Jordan Lee",
      role: "Head of Design",
      bio: "Design systems + AI-native UX.",
      avatar: <Avatar className="size-16"><AvatarImage src="/jordan.jpg" alt="" /><AvatarFallback>JL</AvatarFallback></Avatar>,
    },
  ]}
/>`,
			composition: ["marketing", "team", "about", "landing"],
		},
	],
	ai: {
		whenToUse:
			"Use on About / Team pages or below the hero on a landing page to add credibility. Three columns reads as 'small team / founders'; four reads as 'scaled team'.",
		whenNotToUse:
			"Don't use for customer logos (use marketing-logo-cloud) or testimonials (use marketing-testimonial). Don't pad with placeholder members.",
		commonMistakes: [
			"Mixing avatar sizes — pick one size class (size-16, size-20) and apply consistently.",
			"Putting links to every social network — pick 1–2 most relevant (LinkedIn / GitHub for tech, Twitter / IG for consumer).",
			"Long bios — keep to 1–2 lines per member or the grid gets ragged.",
		],
		relatedComponents: ["avatar", "marketing-testimonial", "marketing-logo-cloud"],
		accessibilityNotes:
			"Each card title renders as <h3> under the section <h2>. Decorative avatars use alt=\"\" since the name is in adjacent text. Social-link icons must carry an accessible name (aria-label or sr-only text).",
		tokenBudget: 600,
	},
	tags: ["block", "marketing", "team", "about", "landing"],
};
