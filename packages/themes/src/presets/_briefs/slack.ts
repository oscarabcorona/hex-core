// Originally generated from voltagent/awesome-design-md (MIT) and hand-curated since.
export const slackBrief = `# Design System Inspired by Slack

## 1. Visual Theme & Atmosphere

Slack's marketing website is a confident, enterprise-friendly showcase that balances Salesforce's corporate muscle with Slack's original playful personality. The design operates on a white canvas with deep aubergine purple (\`#481a54\`, \`#4a154b\`) as the signature brand color — a rich, wine-dark hue that distinguishes Slack from every blue-dominated enterprise tool. Product screenshots and animated UI demos punctuate the white space, creating a "see it in action" experience.

The typography reflects Slack's acquisition by Salesforce: Salesforce-Avant-Garde handles display headings at massive scale (64px, weight 700) with negative letter-spacing (-0.768px), while Salesforce-Sans serves as the UI/body workhorse. Both fonts carry Salesforce's geometric precision but retain enough warmth to feel approachable. Uppercase button labels with positive letter-spacing (0.8px–0.96px) create a systematic, enterprise-label voice.

What makes Slack distinctive is its hover behavior: buttons transition from a soft lavender (\`#f9f0ff\`) to deep aubergine (\`#4a154b\`) on hover with a \`translate(3px)\` shift — a playful micro-animation that retains Slack's personality within the Salesforce design language. The sidebar highlight blue (\`#1264a3\`) provides the secondary interactive accent, and the overall shadow system uses soft, wide-radius shadows (\`0px 0px 32px\` at 0.1 opacity) that create a gentle, cloud-like elevation.

**Key Characteristics:**
- Aubergine purple (\`#481a54\`, \`#4a154b\`) as singular brand color — distinctive in an ocean of blue enterprise tools
- Salesforce-Avant-Garde for display (up to 64px, weight 700, negative tracking)
- Salesforce-Sans for body/UI with both positive and negative letter-spacing variants
- Soft lavender button (\`#f9f0ff\`) → aubergine hover with translate(3px) animation
- Sidebar Blue (\`#1264a3\`) as secondary interactive accent
- Uppercase labels with wide tracking (0.8px–0.96px) for enterprise structure
- Soft, wide-radius shadows (32px blur at 0.1 opacity) — cloud-like elevation
- Purple inset ring (\`rgb(97,31,105) 0px 0px 0px 1px inset\`) for active states

## 2. Color Palette & Roles

### Primary Brand
- **Aubergine** (\`#481a54\`): Deep purple brand color — hero backgrounds, dark sections
- **Aubergine Dark** (\`#4a154b\`): Button hover, slightly different shade for depth
- **Aubergine Link** (\`#611f69\`): Purple link text variant

### Interactive
- **Sidebar Blue** (\`#1264a3\`): \`--sidebar-highlight-color\`, active states, focus borders
- **Hover Blue** (\`#3860be\`): All link hover states transition to this blue
- **Lavender Surface** (\`#f9f0ff\`): Primary button background — soft, inviting purple tint
- **Purple Border** (\`#592466\`): Button borders on purple context
- **Purple Inset** (\`rgb(97, 31, 105)\`): Inset ring shadow for active/focus

### Text
- **White** (\`#ffffff\`): Primary text on dark/purple surfaces
- **Near Black** (\`#1d1d1d\`): Primary text on light surfaces
- **Black** (\`#000000\`): Secondary, attachment color
- **Mid Gray** (\`#696969\`): Muted text, secondary descriptions

### Shadows
- **Soft Wide** (\`rgba(0,0,0,0.1) 0px 0px 32px\`): Primary card elevation — cloud-like
- **Button Lift** (\`rgba(0,0,0,0.1) 0px 5px 20px\`): Button default shadow
- **Subtle** (\`rgba(0,0,0,0.2) 0px 1px 10px\`): Light elevation

## 3. Typography Rules

### Font Families
- **Display**: \`Salesforce-Avant-Garde\`, fallbacks: \`system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans\`
- **Body / UI**: \`Salesforce-Sans\`, same fallback stack

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | SF-Avant-Garde | 64px (4.00rem) | 700 | 1.12 (tight) | -0.768px | Maximum impact |
| Display Secondary | SF-Avant-Garde | 58px (3.63rem) | 600 | 1.25 (tight) | -0.464px | Sub-hero |
| Section Heading | SF-Avant-Garde | 50px (3.13rem) | 700 | 1.12 (tight) | -0.6px | Feature sections |
| Sub-heading | SF-Avant-Garde | 32px (2.00rem) | 700 | 1.25 (tight) | -0.256px | Card headings |
| Card Title | SF-Avant-Garde | 24px (1.50rem) | 700 | 1.33 | -0.096px | Smaller headings |
| Feature Label | SF-Avant-Garde | 18px (1.13rem) | 600 | 1.56 | -0.0216px | Feature emphasis |
| Body Bold | Salesforce-Sans | 18px (1.13rem) | 700 | 1.55–1.67 | -0.072px | Strong body |
| Body | Salesforce-Sans | 18px (1.13rem) | 400 | 1.55 | -0.0216px | Standard reading |
| Body Light | Salesforce-Sans | 18px (1.13rem) | 300 | — | — | Light variant |
| Button Large | SF-Avant-Garde / SF-Sans | 18px (1.13rem) | 700 | — | — | Primary CTA |
| Button | Salesforce-Sans | 16px (1.00rem) | 700 | 1.38 | 0.2px | Standard button |
| Nav Bold | Salesforce-Sans | 15px (0.94rem) | 700 | 1.55 | -0.0216px | Navigation |
| Caption | Salesforce-Sans | 14px (0.88rem) | 400–700 | 1.30–1.55 | 0.1px | Metadata |
| Uppercase Label | Salesforce-Sans | 14px (0.88rem) | 700 | 1.29 (tight) | 0.798px | \`text-transform: uppercase\` |
| Uppercase Small | Salesforce-Sans | 12px (0.75rem) | 700 | 1.00 (tight) | 0.96px | \`text-transform: uppercase\` |

### Principles
- **Dual-font Salesforce system**: Avant-Garde for display authority, Sans for body reliability. The enterprise weight of Salesforce's type system gives Slack corporate credibility.
- **Negative tracking on display**: -0.256px to -0.768px on headings creates compressed, impactful titles.
- **Positive tracking on labels**: +0.2px to +0.96px on uppercase labels creates the structured enterprise labeling system.
- **Weight 700 dominant for headings**: Both fonts use bold as the primary heading weight — confident, not subtle.

## 4. Component Stylings

### Buttons

**Primary Lavender**
- Background: \`#f9f0ff\` (soft lavender)
- Text: \`#000000\`
- Padding: 10px 30px
- Shadow: \`rgba(0,0,0,0.1) 0px 5px 20px\`
- Hover: background \`#4a154b\` (aubergine), text white, border \`2px solid #1264a3\`, translate(3px)
- Active: text \`#1264a3\`, inset ring \`rgb(255,255,255) 0px 0px 0px 2px inset\`, dotted outline \`#611f69\`
- The signature button — lavender to aubergine on hover

**Pill Button (90px radius)**
- Salesforce-Sans 16px weight 700
- Various background treatments
- 90px radius creates large pill shape

**Uppercase Small**
- Salesforce-Sans 12px weight 700
- \`text-transform: uppercase\`
- Letter-spacing: 0.96px
- 4px radius

### Cards & Containers
- Background: white
- Radius: 16px (cards), 48px (large panels)
- Shadow: \`rgba(0,0,0,0.1) 0px 0px 32px\` (soft, wide)
- Border: \`1px solid rgba(0,0,0,0.04)\` (ultra-subtle)
- Product screenshots as primary card content

### Navigation
- Dark aubergine header or white header
- Salesforce-Sans 15px weight 700 for nav links
- Slack/Salesforce logo left-aligned
- Lavender CTA button right-aligned
- Mobile: hamburger with 4px radius toggle

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 4px, 5px, 6px, 8px, 10px, 12px, 16px, 19px, 20px, 23px, 24px, 28px

### Grid & Container
- Centered content with generous max-width
- Product demo sections with screenshots
- Stat counter sections with large numbers
- Trust bar with company logos
- Full-width aubergine footer

### Whitespace Philosophy
- **Enterprise generosity**: Wide spacing between sections creates a professional, unhurried pace that communicates stability.
- **Demo-forward**: Product screenshots and UI demos get generous space to breathe.

### Border Radius Scale
- Minimal (2px): Close buttons, small utility
- Subtle (4px): Standard buttons, search
- Standard (8px): List items, video containers
- Comfortable (12px): Video, medium panels
- Card (16px): Feature cards, navigation
- Large (48px): Hero panels, large containers
- Pill (90px): Primary CTA buttons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Default surfaces |
| Soft Wide (Level 1) | \`rgba(0,0,0,0.1) 0px 0px 32px\` | Cards, demo panels |
| Button (Level 2) | \`rgba(0,0,0,0.1) 0px 5px 20px\` | CTA buttons |
| Subtle (Level 3) | \`rgba(0,0,0,0.2) 0px 1px 10px\` | Dropdowns |
| Purple Inset | \`rgb(97,31,105) 0px 0px 0px 1px inset\` | Active state ring |

**Shadow Philosophy**: Slack uses notably wide-radius shadows (32px blur) at low opacity (0.1), creating a cloud-like floating quality. Elements don't appear elevated — they appear to gently hover, reflecting the "Slack is where work happens in the cloud" metaphor.

## 7. Do's and Don'ts

### Do
- Use aubergine (\`#481a54\` / \`#4a154b\`) as the primary brand color — it's Slack's identity
- Apply the lavender-to-aubergine hover transition on primary buttons
- Use Salesforce-Avant-Garde for display headings only, Salesforce-Sans for everything else
- Apply uppercase + positive letter-spacing (0.8px–0.96px) for labels and small buttons
- Use wide-radius shadows (32px blur) for cloud-like elevation
- Include the translate(3px) hover animation on buttons
- Use Sidebar Blue (\`#1264a3\`) for secondary interactive accents

### Don't
- Don't use standard blue as the primary brand color — aubergine is non-negotiable
- Don't skip the hover animation (translate + color shift) on primary buttons
- Don't use heavy/sharp shadows — Slack's elevation is soft and wide
- Don't apply negative letter-spacing to button labels — buttons use positive tracking
- Don't use aubergine as body text color — it's for surfaces and dark sections
- Don't mix Avant-Garde into body text — it's display-only

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <479px | Single column, hamburger nav |
| Mobile Large | 479–768px | Slight adjustments |
| Tablet | 768–1024px | 2-column layouts begin |
| Desktop | 1024–1280px | Standard desktop layout |
| Large Desktop | 1280–1440px | Expanded |
| Ultra-wide | >1440px | Maximum width |

### Collapsing Strategy
- Hero: 64px → 50px → scales down
- Navigation: horizontal → hamburger (4px radius toggle)
- Feature sections: side-by-side → stacked
- Stats: horizontal counters → vertical
- Buttons: maintain pill shape, full-width on mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand: Aubergine (\`#481a54\`)
- Button: Lavender (\`#f9f0ff\`)
- Button hover: Aubergine Dark (\`#4a154b\`)
- Interactive: Sidebar Blue (\`#1264a3\`)
- Text light: White (\`#ffffff\`)
- Text dark: Near Black (\`#1d1d1d\`)
- Muted: Mid Gray (\`#696969\`)

### Example Component Prompts
- "Create a hero: white background. Headline at 64px Salesforce-Avant-Garde weight 700, line-height 1.12, letter-spacing -0.768px, black text. Lavender CTA button (#f9f0ff, 10px 30px padding, shadow rgba(0,0,0,0.1) 0px 5px 20px). On hover: aubergine (#4a154b) background, white text, translate(3px)."
- "Design an aubergine section: #481a54 background. White text at 32px SF-Avant-Garde weight 700. Stat counters at 50px weight 700."
- "Build uppercase label: 12px Salesforce-Sans weight 700, text-transform uppercase, letter-spacing 0.96px."
- "Create a card: white background, 16px radius, shadow rgba(0,0,0,0.1) 0px 0px 32px. Product screenshot inside."

### Iteration Guide
1. Aubergine purple is the signature — every design should include it somewhere
2. Lavender (#f9f0ff) buttons with aubergine hover = the Slack interaction
3. Salesforce-Avant-Garde for display, Salesforce-Sans for body — strict split
4. Uppercase + positive tracking for labels and small buttons
5. Soft wide shadows (32px blur) for the cloud-floating quality
6. translate(3px) on hover for playful enterprise personality
`;
