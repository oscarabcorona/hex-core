import type { RecipeDefinition } from "../recipe-schema.js";

export const landingHeroRecipe: RecipeDefinition = {
	slug: "landing-hero",
	title: "Landing hero",
	summary:
		"Marketing-page hero that composes the Phase 2 motion catalog: FadeIn headline + SlideIn subhead + ScaleIn primary CTA + CountUp stat tiles. Demonstrates how the wrappers compose with the existing layout primitives without writing any timeline JSX.",
	tags: ["motion", "hero", "landing", "marketing", "stats", "intro"],
	brief:
		"Build a marketing landing-page hero. The headline should fade in, the subhead should slide up after it, the primary CTA should scale in last, and three numeric stat tiles should count up below. Use named easings; respect prefers-reduced-motion.",
	steps: [
		{
			component: "container",
			reason: "Bound the hero width and center it on the viewport",
			role: "supporting",
		},
		{
			component: "stack",
			reason: "Vertical rhythm between headline / subhead / CTA",
			role: "supporting",
		},
		{
			component: "button",
			reason: "Primary CTA target",
			role: "primary",
		},
		{
			component: "fade-in",
			reason: "Headline reveal — opacity 0 → 1",
			role: "primary",
		},
		{
			component: "slide-in",
			reason: "Subhead rises into place after the headline",
			role: "primary",
		},
		{
			component: "scale-in",
			reason: "CTA lands with a deliberate pop",
			role: "primary",
		},
		{
			component: "count-up",
			reason: "Stat tiles tween from 0 to their target",
			role: "supporting",
		},
		{
			component: "stagger",
			reason: "Cascade the three stat tiles for orchestrated impact",
			role: "optional",
		},
	],
	checklist: [
		{
			id: "prefers-reduced-motion",
			check:
				"Do NOT pass `MotionConfig reducedMotion=\"never\"` in production — every wrapper honors the OS setting by default and that's the whole point.",
			severity: "blocker",
			source: "author",
		},
		{
			id: "stagger-fade-not-other",
			check:
				"<Stagger> injects a `delay` prop. Wrap fade-in/slide-in/scale-in/count-up children only — wrappers without a delay prop pass through unchanged.",
			severity: "warn",
			source: "author",
		},
		{
			id: "cta-easing",
			check:
				"The CTA's <ScaleIn> uses `easing=\"emphasized\"` so it lands with attention, not the standard linear-ish curve.",
			severity: "warn",
			source: "author",
		},
		{
			id: "count-up-format",
			check:
				"For non-integer stats (1.2M, 99.9%), pass a `format` callback that's memoized with useMemo — inline arrow functions cause the tween to restart every render.",
			severity: "warn",
			source: "author",
		},
		{
			id: "duration-budget",
			check:
				"Hero should reach interactive state by ~1200ms. Cap individual wrapper durations at 400ms; cascade delays at ≤180ms.",
			severity: "warn",
			source: "author",
		},
	],
	example: `import { Container } from "@/components/ui/container";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideIn, ScaleIn, CountUp, Stagger } from "@hex-core/motion";

export function LandingHero() {
  return (
    <Container>
      <Stack gap="lg">
        <FadeIn duration={350}>
          <h1 className="text-5xl font-bold tracking-tight">Ship spec-driven UI.</h1>
        </FadeIn>
        <SlideIn direction="bottom" delay={150} duration={400}>
          <p className="text-lg text-muted-foreground">
            From brief to component checklist over MCP.
          </p>
        </SlideIn>
        <ScaleIn delay={350} duration={400} easing="emphasized">
          <Button size="lg">Get started</Button>
        </ScaleIn>
        <Stagger gap={150} initialDelay={500} className="grid grid-cols-3 gap-6">
          <FadeIn duration={300}>
            <Stat label="Components"><CountUp to={117} duration={1200} /></Stat>
          </FadeIn>
          <FadeIn duration={300}>
            <Stat label="Motion items"><CountUp to={26} duration={1100} /></Stat>
          </FadeIn>
          <FadeIn duration={300}>
            <Stat label="Skills"><CountUp to={9} duration={1000} /></Stat>
          </FadeIn>
        </Stagger>
      </Stack>
    </Container>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-card p-4 text-center">
      <div className="text-3xl font-bold">{children}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}`,
	tokenBudget: 2400,
};
