---
"@hex-core/components": minor
"@hex-core/cli": patch
---

feat(blocks): blocks tier + complete password-auth journey end-to-end

Introduces **blocks** as a third tier above primitives and components — page-level compositions (sign-in pages, landing heroes, app shells) that share the registry, schema convention, and `hex add` install surface. Ships the foundation plus the **full password-auth journey** (sign-up → verify-email → sign-in → forgot → reset → sign-in, plus an OTP path for sign-in / verify-email / MFA) wired end-to-end through every layer of the pipeline.

**`@hex-core/components` — new exports:**

Pluggable adapter contract:
- `AuthAdapter`, `AuthAdapterResult`, `AuthOtpIntent`, `AuthSocialProvider` — every auth block consumes the adapter via its `adapter` prop. Hex Core ships no session management; the adapter routes credential / OAuth / OTP handoffs to whatever the consumer wires up (better-auth, Clerk, NextAuth, Supabase Auth, custom server). Every method is optional so consumers can ship password-only on day one and add passkeys / OTP later without forking block source.
- `mockAuthAdapter` — in-memory reference adapter for showcase routes and tests. Every method delays 400ms and resolves `{ ok: true }`. Never ship in production.

Six auth blocks composing the password journey:
- `AuthSignInSplit` — split-screen sign-in (marketing left, credential form right) with email + password, remember-me, optional social, forgot-password link.
- `AuthSignUpCard` — centered-card sign-up with name (optional) + email + password (with confirm) + terms checkbox + optional social. Manual validation: email regex, password length, confirm-match, terms.
- `AuthForgotPassword` — single-field form that swaps to an `Empty`-based "check your inbox" confirmation state on success.
- `AuthResetPassword` — token-driven new-password + confirm form. Reads the opaque token from a prop (typically `?token=…` searchParam).
- `AuthVerifyEmail` — transactional waiting page with optional resend cooldown. Resend button hides automatically when `adapter.resendMagicLink` is absent.
- `AuthVerifyOtp` — N-digit (default 6) auto-submitting code input. Drives the heading and adapter routing from the `intent` prop (`"sign-in" | "verify-email" | "mfa"`).

Two new optional methods on `AuthAdapter` (additive — no breaking change):
- `resendMagicLink?(p: { email })` — distinct from `sendMagicLink` so consumers can throttle resends and surface separate analytics / error copy.
- `resendOtp?(p: { intent })` — distinct from the initial code dispatch for the same reason.

Every block: `.tsx` source + co-located `.schema.ts` (machine-readable AI hints, common mistakes, accessibility notes, token budget) + behavioral test (Testing Library + userEvent + warnSpy). Every block falls back to a generic user-facing error message and a structured `console.warn` when an adapter method is unimplemented.

**`@hex-core/cli` — `rewrite-imports` fix for cross-tree block imports:**

The legacy regex matched sibling-component imports (`../<name>/<name>`) and primitives (`../../primitives/<name>/<name>`) but not the cross-tree shape blocks need: a block at `blocks/<slug>/<slug>.tsx` reaches into `components/` two segments deep. `npx hex add auth-sign-in-split` (and any other auth block) now rewrites `../../components/alert/alert` to `@/components/ui/alert` correctly. Covered by a unit test.

**Pipeline coverage shipped in this release:**

- 6 block items in `registry/items/` + 6 auth recipes in `registry/recipes/` (5 new + the deprecated `auth-form` superseded by `auth-sign-in`)
- 6 live demos + 6 showcase route pairs (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-otp`) — each pair is a server component owning `metadata` + a `"use client"` wrapper owning the adapter binding
- Concept doc at `/docs/blocks` with embedded live preview + install commands + a "Password-auth journey" gallery linking every showcase route
- MCP contract test asserts the journey: `search_components({ category: "block" })` returns ≥6 blocks containing every expected slug; `get_component("auth-sign-in-split")` round-trips with required `adapter` prop and bundled `components/_shared/auth-adapter.tsx` source
- 41 new behavioral tests across the 6 blocks (form submit, error display, social click, auto-submit-when-full for OTP, resend cooldown, unimplemented-method fallback, …)
- A11y audit clean on every showcase route in light + dark
- Visual regression baselines committed for every block (light + dark)
- `hex add auth-sign-up-card` smoked end-to-end against a temp project; imports rewrite to `@/`-aliased paths; `_shared/auth-adapter.tsx` ships once
- `hex recipe add auth-sign-up` smoked: 9 ordered steps + checklist printed
- `auth-form` recipe is deprecated in favor of `auth-sign-in` (retained for back-compat with deprecation note in title + summary)

No breaking changes. Tree-shake-safe — consumers only pay for what they install.
