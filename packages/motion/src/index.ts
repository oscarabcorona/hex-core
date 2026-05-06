// Engine
export { realtimeClock, manualClock, type Clock, type ManualClock } from "./engine/clock.js";
export {
	waapiDriver,
	cssVarDriver,
	type Driver,
	type DriverContext,
	type RunningAnimation,
} from "./engine/driver.js";
export {
	buildKeyframes,
	hasAnimatableDiff,
	type AnimateProps,
	type Transition,
	type BuiltKeyframes,
} from "./engine/keyframes.js";
export { tokenEasing, springToBezier, type EasingName } from "./engine/easing.js";
export { shouldReduceMotion, type ReducedMotionMode } from "./engine/reduced-motion.js";

// React API
export { Motion, type MotionExtraProps, type MotionComponentProps } from "./react/Motion.js";
export { Presence } from "./react/Presence.js";
export {
	MotionConfig,
	useMotionContext,
	type MotionContextValue,
	type MotionConfigProps,
} from "./react/MotionConfig.js";
export { useAnimate, type AnimateFn } from "./react/useAnimate.js";
export {
	useMotionValue,
	useMotionValueRender,
	type MotionValue,
} from "./react/useMotionValue.js";
export { useScroll, type UseScrollResult } from "./react/useScroll.js";
export { useInView, type UseInViewOptions } from "./react/useInView.js";
export { useTween } from "./react/useTween.js";
export { variants, resolveVariant, type Variants, type VariantState } from "./react/variants.js";
export { parseMotionDataAttr, type ParsedMotion } from "./react/data-attr.js";

// Phase 2 popular-animation catalog
export { FadeIn, type FadeInProps } from "./components/fade-in/fade-in.js";
export { SlideIn, type SlideInProps, type SlideDirection } from "./components/slide-in/slide-in.js";
export { ScaleIn, type ScaleInProps } from "./components/scale-in/scale-in.js";
export { BlurIn, type BlurInProps } from "./components/blur-in/blur-in.js";
export { Pulse, type PulseProps } from "./components/pulse/pulse.js";
export { Bounce, type BounceProps } from "./components/bounce/bounce.js";
export { Shimmer, type ShimmerProps } from "./components/shimmer/shimmer.js";
export { Stagger, type StaggerProps } from "./components/stagger/stagger.js";
export {
	RevealOnScroll,
	type RevealOnScrollProps,
} from "./components/reveal-on-scroll/reveal-on-scroll.js";
export { CountUp, type CountUpProps } from "./components/count-up/count-up.js";
export { Typewriter, type TypewriterProps } from "./components/typewriter/typewriter.js";
export { Marquee, type MarqueeProps } from "./components/marquee/marquee.js";
export { Shake, type ShakeProps } from "./components/shake/shake.js";
export { Parallax, type ParallaxProps } from "./components/parallax/parallax.js";
export {
	PageTransition,
	type PageTransitionProps,
} from "./components/page-transition/page-transition.js";
