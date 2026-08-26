// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
// The one-shot importer was removed once its output diverged from a clean
// re-run; recover it from git history (`git show 870fbcc:scripts/import-voltagent.ts`)
// if the upstream briefs ever need re-importing.
// Source: voltagent/awesome-design-md (MIT) — https://github.com/voltagent/awesome-design-md
import type { Theme, ThemeCategory } from "@hex-core/registry";
import { briefLoaders } from "./briefs.generated.js";
import { airbnbTheme } from "./airbnb.js";
import { airtableTheme } from "./airtable.js";
import { appleTheme } from "./apple.js";
import { binanceTheme } from "./binance.js";
import { bmwTheme } from "./bmw.js";
import { bmwMTheme } from "./bmw-m.js";
import { bugattiTheme } from "./bugatti.js";
import { calTheme } from "./cal.js";
import { claudeTheme } from "./claude.js";
import { clayTheme } from "./clay.js";
import { clickhouseTheme } from "./clickhouse.js";
import { cohereTheme } from "./cohere.js";
import { coinbaseTheme } from "./coinbase.js";
import { composioTheme } from "./composio.js";
import { cursorTheme } from "./cursor.js";
import { elevenlabsTheme } from "./elevenlabs.js";
import { expoTheme } from "./expo.js";
import { ferrariTheme } from "./ferrari.js";
import { figmaTheme } from "./figma.js";
import { framerTheme } from "./framer.js";
import { hashicorpTheme } from "./hashicorp.js";
import { ibmTheme } from "./ibm.js";
import { intercomTheme } from "./intercom.js";
import { krakenTheme } from "./kraken.js";
import { lamborghiniTheme } from "./lamborghini.js";
import { linearTheme } from "./linear.js";
import { lovableTheme } from "./lovable.js";
import { mastercardTheme } from "./mastercard.js";
import { metaTheme } from "./meta.js";
import { minimaxTheme } from "./minimax.js";
import { mintlifyTheme } from "./mintlify.js";
import { miroTheme } from "./miro.js";
import { mistralTheme } from "./mistral.js";
import { mongodbTheme } from "./mongodb.js";
import { nikeTheme } from "./nike.js";
import { notionTheme } from "./notion.js";
import { nvidiaTheme } from "./nvidia.js";
import { ollamaTheme } from "./ollama.js";
import { opencodeTheme } from "./opencode.js";
import { pinterestTheme } from "./pinterest.js";
import { playstationTheme } from "./playstation.js";
import { posthogTheme } from "./posthog.js";
import { raycastTheme } from "./raycast.js";
import { renaultTheme } from "./renault.js";
import { replicateTheme } from "./replicate.js";
import { resendTheme } from "./resend.js";
import { revolutTheme } from "./revolut.js";
import { runwaymlTheme } from "./runwayml.js";
import { sanityTheme } from "./sanity.js";
import { sentryTheme } from "./sentry.js";
import { shopifyTheme } from "./shopify.js";
import { slackTheme } from "./slack.js";
import { spacexTheme } from "./spacex.js";
import { spotifyTheme } from "./spotify.js";
import { starbucksTheme } from "./starbucks.js";
import { stripeTheme } from "./stripe.js";
import { supabaseTheme } from "./supabase.js";
import { superhumanTheme } from "./superhuman.js";
import { teslaTheme } from "./tesla.js";
import { thevergeTheme } from "./theverge.js";
import { togetherTheme } from "./together.js";
import { uberTheme } from "./uber.js";
import { vercelTheme } from "./vercel.js";
import { vodafoneTheme } from "./vodafone.js";
import { voltagentTheme } from "./voltagent.js";
import { warpTheme } from "./warp.js";
import { webflowTheme } from "./webflow.js";
import { wiredTheme } from "./wired.js";
import { wiseTheme } from "./wise.js";
import { xTheme } from "./x.js";
import { zapierTheme } from "./zapier.js";

export { airbnbTheme } from "./airbnb.js";
export { airtableTheme } from "./airtable.js";
export { appleTheme } from "./apple.js";
export { binanceTheme } from "./binance.js";
export { bmwTheme } from "./bmw.js";
export { bmwMTheme } from "./bmw-m.js";
export { bugattiTheme } from "./bugatti.js";
export { calTheme } from "./cal.js";
export { claudeTheme } from "./claude.js";
export { clayTheme } from "./clay.js";
export { clickhouseTheme } from "./clickhouse.js";
export { cohereTheme } from "./cohere.js";
export { coinbaseTheme } from "./coinbase.js";
export { composioTheme } from "./composio.js";
export { cursorTheme } from "./cursor.js";
export { elevenlabsTheme } from "./elevenlabs.js";
export { expoTheme } from "./expo.js";
export { ferrariTheme } from "./ferrari.js";
export { figmaTheme } from "./figma.js";
export { framerTheme } from "./framer.js";
export { hashicorpTheme } from "./hashicorp.js";
export { ibmTheme } from "./ibm.js";
export { intercomTheme } from "./intercom.js";
export { krakenTheme } from "./kraken.js";
export { lamborghiniTheme } from "./lamborghini.js";
export { linearTheme } from "./linear.js";
export { lovableTheme } from "./lovable.js";
export { mastercardTheme } from "./mastercard.js";
export { metaTheme } from "./meta.js";
export { minimaxTheme } from "./minimax.js";
export { mintlifyTheme } from "./mintlify.js";
export { miroTheme } from "./miro.js";
export { mistralTheme } from "./mistral.js";
export { mongodbTheme } from "./mongodb.js";
export { nikeTheme } from "./nike.js";
export { notionTheme } from "./notion.js";
export { nvidiaTheme } from "./nvidia.js";
export { ollamaTheme } from "./ollama.js";
export { opencodeTheme } from "./opencode.js";
export { pinterestTheme } from "./pinterest.js";
export { playstationTheme } from "./playstation.js";
export { posthogTheme } from "./posthog.js";
export { raycastTheme } from "./raycast.js";
export { renaultTheme } from "./renault.js";
export { replicateTheme } from "./replicate.js";
export { resendTheme } from "./resend.js";
export { revolutTheme } from "./revolut.js";
export { runwaymlTheme } from "./runwayml.js";
export { sanityTheme } from "./sanity.js";
export { sentryTheme } from "./sentry.js";
export { shopifyTheme } from "./shopify.js";
export { slackTheme } from "./slack.js";
export { spacexTheme } from "./spacex.js";
export { spotifyTheme } from "./spotify.js";
export { starbucksTheme } from "./starbucks.js";
export { stripeTheme } from "./stripe.js";
export { supabaseTheme } from "./supabase.js";
export { superhumanTheme } from "./superhuman.js";
export { teslaTheme } from "./tesla.js";
export { thevergeTheme } from "./theverge.js";
export { togetherTheme } from "./together.js";
export { uberTheme } from "./uber.js";
export { vercelTheme } from "./vercel.js";
export { vodafoneTheme } from "./vodafone.js";
export { voltagentTheme } from "./voltagent.js";
export { warpTheme } from "./warp.js";
export { webflowTheme } from "./webflow.js";
export { wiredTheme } from "./wired.js";
export { wiseTheme } from "./wise.js";
export { xTheme } from "./x.js";
export { zapierTheme } from "./zapier.js";

/** Every voltagent-derived preset, keyed by slug. */
export const voltagentPresets: Record<string, Theme> = {
	"airbnb": airbnbTheme,
	"airtable": airtableTheme,
	"apple": appleTheme,
	"binance": binanceTheme,
	"bmw": bmwTheme,
	"bmw-m": bmwMTheme,
	"bugatti": bugattiTheme,
	"cal": calTheme,
	"claude": claudeTheme,
	"clay": clayTheme,
	"clickhouse": clickhouseTheme,
	"cohere": cohereTheme,
	"coinbase": coinbaseTheme,
	"composio": composioTheme,
	"cursor": cursorTheme,
	"elevenlabs": elevenlabsTheme,
	"expo": expoTheme,
	"ferrari": ferrariTheme,
	"figma": figmaTheme,
	"framer": framerTheme,
	"hashicorp": hashicorpTheme,
	"ibm": ibmTheme,
	"intercom": intercomTheme,
	"kraken": krakenTheme,
	"lamborghini": lamborghiniTheme,
	"linear": linearTheme,
	"lovable": lovableTheme,
	"mastercard": mastercardTheme,
	"meta": metaTheme,
	"minimax": minimaxTheme,
	"mintlify": mintlifyTheme,
	"miro": miroTheme,
	"mistral": mistralTheme,
	"mongodb": mongodbTheme,
	"nike": nikeTheme,
	"notion": notionTheme,
	"nvidia": nvidiaTheme,
	"ollama": ollamaTheme,
	"opencode": opencodeTheme,
	"pinterest": pinterestTheme,
	"playstation": playstationTheme,
	"posthog": posthogTheme,
	"raycast": raycastTheme,
	"renault": renaultTheme,
	"replicate": replicateTheme,
	"resend": resendTheme,
	"revolut": revolutTheme,
	"runwayml": runwaymlTheme,
	"sanity": sanityTheme,
	"sentry": sentryTheme,
	"shopify": shopifyTheme,
	"slack": slackTheme,
	"spacex": spacexTheme,
	"spotify": spotifyTheme,
	"starbucks": starbucksTheme,
	"stripe": stripeTheme,
	"supabase": supabaseTheme,
	"superhuman": superhumanTheme,
	"tesla": teslaTheme,
	"theverge": thevergeTheme,
	"together": togetherTheme,
	"uber": uberTheme,
	"vercel": vercelTheme,
	"vodafone": vodafoneTheme,
	"voltagent": voltagentTheme,
	"warp": warpTheme,
	"webflow": webflowTheme,
	"wired": wiredTheme,
	"wise": wiseTheme,
	"x": xTheme,
	"zapier": zapierTheme,
};

/** Presets grouped by category for category-aware UIs (Studio's grid). */
export const presetsByCategory: Record<ThemeCategory, readonly Theme[]> = {
	"ai": [claudeTheme, cohereTheme, elevenlabsTheme, minimaxTheme, mistralTheme, ollamaTheme, opencodeTheme, replicateTheme, runwaymlTheme, togetherTheme, voltagentTheme, xTheme],
	"dev-tools": [cursorTheme, expoTheme, lovableTheme, raycastTheme, superhumanTheme, vercelTheme, warpTheme],
	"backend": [clickhouseTheme, composioTheme, hashicorpTheme, mongodbTheme, posthogTheme, sanityTheme, sentryTheme, supabaseTheme],
	"productivity": [calTheme, intercomTheme, linearTheme, mintlifyTheme, notionTheme, resendTheme, slackTheme, zapierTheme],
	"design": [airtableTheme, clayTheme, figmaTheme, framerTheme, miroTheme, webflowTheme],
	"fintech": [binanceTheme, coinbaseTheme, krakenTheme, mastercardTheme, revolutTheme, stripeTheme, wiseTheme],
	"ecommerce": [airbnbTheme, metaTheme, nikeTheme, shopifyTheme, starbucksTheme],
	"media": [appleTheme, ibmTheme, nvidiaTheme, pinterestTheme, playstationTheme, spacexTheme, spotifyTheme, thevergeTheme, uberTheme, vodafoneTheme, wiredTheme],
	"automotive": [bmwTheme, bmwMTheme, bugattiTheme, ferrariTheme, lamborghiniTheme, renaultTheme, teslaTheme],
};

/** All preset slugs in alphabetical order. */
export const presetSlugs: readonly string[] = [
	"airbnb",
	"airtable",
	"apple",
	"binance",
	"bmw",
	"bmw-m",
	"bugatti",
	"cal",
	"claude",
	"clay",
	"clickhouse",
	"cohere",
	"coinbase",
	"composio",
	"cursor",
	"elevenlabs",
	"expo",
	"ferrari",
	"figma",
	"framer",
	"hashicorp",
	"ibm",
	"intercom",
	"kraken",
	"lamborghini",
	"linear",
	"lovable",
	"mastercard",
	"meta",
	"minimax",
	"mintlify",
	"miro",
	"mistral",
	"mongodb",
	"nike",
	"notion",
	"nvidia",
	"ollama",
	"opencode",
	"pinterest",
	"playstation",
	"posthog",
	"raycast",
	"renault",
	"replicate",
	"resend",
	"revolut",
	"runwayml",
	"sanity",
	"sentry",
	"shopify",
	"slack",
	"spacex",
	"spotify",
	"starbucks",
	"stripe",
	"supabase",
	"superhuman",
	"tesla",
	"theverge",
	"together",
	"uber",
	"vercel",
	"vodafone",
	"voltagent",
	"warp",
	"webflow",
	"wired",
	"wise",
	"x",
	"zapier",
];

/**
 * Lazily load the original markdown design brief for a preset.
 *
 * Briefs are NOT inlined on the preset object — the top-level
 * `@hex-core/themes` barrel stays tree-shakeable. Studio's
 * `/studio/copy` flow (the only consumer that actually needs the
 * brief) calls this on demand; agents that just want token data
 * never pay the ~22KB-per-brief cost.
 *
 * @param slug - Preset slug (e.g. `"tesla"`, `"stripe"`)
 * @returns The brief markdown, or `undefined` for unknown slugs.
 */
export async function loadThemeBrief(slug: string): Promise<string | undefined> {
	return briefLoaders[slug]?.();
}

