---
"@hex-core/registry": minor
---

Add `toShadcnRegistryItem` + `shadcnRegistryItemSchema`: project any Hex registry item into shadcn registry-item wire format (category→type mapping, heavyPeer folded into dependencies, cssVariables pivoted to cssVars, `ai` block riding along verbatim). Powers the docs site's `/r/{name}.json` route so `npx shadcn@latest add @hex/<slug>` works against the `@hex` namespace.
