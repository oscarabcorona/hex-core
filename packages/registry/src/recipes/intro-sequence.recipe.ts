import type { RecipeDefinition } from "../recipe-schema.js";

export const introSequenceRecipe: RecipeDefinition = {
	slug: "intro-sequence",
	title: "Intro sequence",
	summary:
		"Hero + subhead + CTA reveal orchestrated by the motion timeline. Demonstrates @hex-core/motion composing existing primitives into a deterministic, agent-authorable sequence.",
	tags: ["motion", "timeline", "hero", "intro", "onboarding", "reveal"],
	brief:
		"Build a landing-page hero where the heading fades + slides up first, the subhead follows shortly after, and the primary CTA scales in last. Same input must always render the same final frame.",
	steps: [
		{
			component: "container",
			reason: "Bound the hero width and center it",
			role: "supporting",
		},
		{
			component: "stack",
			reason: "Vertical rhythm between heading, subhead, CTA",
			role: "supporting",
		},
		{
			component: "button",
			reason: "Primary call-to-action target of the final clip",
			role: "primary",
		},
		{
			component: "motion-timeline",
			reason: "Owns the clock and seek; renders nothing itself",
			role: "primary",
		},
		{
			component: "scene",
			reason: "Group clips into hero / subhead / CTA windows",
			role: "supporting",
		},
		{
			component: "clip",
			reason: "One clip per element targeted by CSS selector",
			role: "supporting",
		},
		{
			component: "transition",
			reason: "Token-aware easing (use `emphasized` for the CTA reveal)",
			role: "optional",
		},
	],
	checklist: [
		{
			id: "stable-target-ids",
			check:
				"Each animated element has a stable `id` (or unique selector) that the matching <Clip target> references.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "from-state-set",
			check:
				"Every <Clip> declares `from` AND `to` so the initial paint matches the t=0 state (no flicker on mount).",
			severity: "blocker",
			source: "author",
		},
		{
			id: "duration-budget",
			check:
				"Total timeline duration stays under 1500ms so the user reaches the interactive state quickly.",
			severity: "warn",
			source: "author",
		},
		{
			id: "respects-reduced-motion",
			check:
				"Do NOT pass `MotionConfig reducedMotion=\"never\"` in production — the timeline collapses to final state when the OS setting is reduce.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "cta-emphasis",
			check:
				"The CTA clip uses `easing=\"emphasized\"` so it lands with attention, not the standard linear-ish curve.",
			severity: "warn",
			source: "author",
		},
	],
	example: `import { Container } from "@/components/ui/container";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Timeline, Scene, Clip } from "@hex-core/motion/timeline";

export function HeroIntro() {
  return (
    <>
      <Container>
        <Stack gap="lg">
          <h1 id="hero-title" style={{ opacity: 0 }}>Ship spec-driven UI.</h1>
          <p id="hero-sub" style={{ opacity: 0 }}>From brief to component checklist over MCP.</p>
          <div id="hero-cta" style={{ opacity: 0, transform: "translateY(24px)" }}>
            <Button size="lg">Get started</Button>
          </div>
        </Stack>
      </Container>
      <Timeline duration={1400} autoPlay>
        <Scene start={0} duration={400}>
          <Clip target="#hero-title" from={{ opacity: 0, y: 8 }} to={{ opacity: 1, y: 0 }} />
        </Scene>
        <Scene start={250} duration={400}>
          <Clip target="#hero-sub" from={{ opacity: 0 }} to={{ opacity: 1 }} />
        </Scene>
        <Scene start={600} duration={500}>
          <Clip target="#hero-cta" from={{ opacity: 0, y: 24 }} to={{ opacity: 1, y: 0 }} easing="emphasized" />
        </Scene>
      </Timeline>
    </>
  );
}`,
	tokenBudget: 1800,
};
