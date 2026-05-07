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
export { variants, resolveVariant, type Variants, type VariantState } from "./react/variants.js";
export { parseMotionDataAttr, type ParsedMotion } from "./react/data-attr.js";
