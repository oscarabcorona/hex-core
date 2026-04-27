import type { TokenValue } from "@hex-core/registry";

/**
 * Layout + typography tokens shared across all themes. Colors/radius vary per
 * theme; these do not (yet). Spread into both light and dark dicts of every
 * Theme so consumers can read any token regardless of color mode.
 */
export const sharedTokens: Record<string, TokenValue> = {
	// ─── Spacing scale (rem) ───
	"space-1": { value: "0.25rem", type: "spacing" },
	"space-2": { value: "0.5rem", type: "spacing" },
	"space-3": { value: "0.75rem", type: "spacing" },
	"space-4": { value: "1rem", type: "spacing" },
	"space-6": { value: "1.5rem", type: "spacing" },
	"space-8": { value: "2rem", type: "spacing" },
	"space-12": { value: "3rem", type: "spacing" },
	"space-16": { value: "4rem", type: "spacing" },

	// ─── Gap presets (for layout primitives) ───
	"gap-xs": { value: "0.25rem", type: "spacing" },
	"gap-sm": { value: "0.5rem", type: "spacing" },
	"gap-md": { value: "1rem", type: "spacing" },
	"gap-lg": { value: "1.5rem", type: "spacing" },
	"gap-xl": { value: "2rem", type: "spacing" },

	// ─── Container max-widths (for prose / layout primitives) ───
	"container-sm": { value: "33rem", type: "dimension" },
	"container-md": { value: "40rem", type: "dimension" },
	"container-lg": { value: "50rem", type: "dimension" },
	"container-xl": { value: "66rem", type: "dimension" },

	// ─── Control heights (interactive elements) ───
	"control-height-sm": { value: "2.25rem", type: "dimension" },
	"control-height-md": { value: "2.5rem", type: "dimension" },
	"control-height-lg": { value: "2.75rem", type: "dimension" },

	// ─── Typography scale ───
	"text-xs": { value: "0.75rem", type: "font" },
	"text-sm": { value: "0.875rem", type: "font" },
	"text-base": { value: "1rem", type: "font" },
	"text-lg": { value: "1.125rem", type: "font" },
	"text-xl": { value: "1.25rem", type: "font" },
	"text-2xl": { value: "1.5rem", type: "font" },
	"text-3xl": { value: "1.875rem", type: "font" },

	// ─── Motion ───
	"duration-fast": { value: "150ms", type: "duration" },
	"duration-normal": { value: "200ms", type: "duration" },
	"duration-slow": { value: "300ms", type: "duration" },
};
