/**
 * Ambient declarations for non-code side-effect imports.
 *
 * Demos live beside their component and occasionally pull in a vendor
 * stylesheet — `canvas.demo.tsx` needs `reactflow/dist/style.css` for the
 * flow canvas to render at all. TypeScript has no built-in knowledge of
 * `.css` modules, and the package deliberately has no bundler-provided
 * ambient types (it ships `.tsx` source, not a Next.js app), so declare
 * them here.
 *
 * Demos are excluded from the tsup entries, so nothing here reaches the
 * published bundle.
 */
declare module "*.css";
