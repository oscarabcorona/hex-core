# @hex-core/components

[![npm](https://img.shields.io/npm/v/@hex-core/components.svg)](https://www.npmjs.com/package/@hex-core/components)
[![downloads](https://img.shields.io/npm/dm/@hex-core/components.svg)](https://www.npmjs.com/package/@hex-core/components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/oscarabcorona/hex-core/blob/main/LICENSE)

AI-native React components — Radix UI + Tailwind CSS + CVA, with machine-readable schemas for every component.

## Install

You typically don't install this package directly. Use the CLI to copy components into your project:

```bash
pnpm dlx @hex-core/cli add button
```

If you want to import the built components directly:

```bash
pnpm add @hex-core/components
```

**Tailwind v4 consumers must register this package's bundle so utility classes resolve.** One line in your app's `globals.css`:

```css
@import "tailwindcss";
@import "@hex-core/components/tailwind.css";
```

Without it, classes like `inset-ring-foreground/[0.06]` (used by Button outline, Input, Card, etc.) appear in the rendered HTML but have no CSS rule, and components render unstyled. Tailwind v4 doesn't auto-scan `node_modules`.

## Imports — barrel vs deep (RSC)

```tsx
// Deep import — RSC-safe for visual primitives, tree-shake friendly
import { Badge } from "@hex-core/components/badge";
import { Card, CardContent } from "@hex-core/components/card";
import { Stack } from "@hex-core/components/stack";

// Barrel import — convenience, but always client-side
import { Button, Card, Stack } from "@hex-core/components";
```

Each component file declares its own `"use client"` directive — and only when it needs one. Deep imports of visual primitives (`Badge`, `Card`, `Stack`, …) render directly inside Next.js Server Components without forcing the subtree client-side. Deep imports of stateful components (`Dialog`, `Form`, `Calendar`, …) carry the directive automatically.

The barrel re-exports everything together, so it's marked client. Existing barrel imports keep working — but if you want RSC + tree-shake, prefer deep imports.

### RSC-safe components (no `"use client"` needed)

`Alert`, `Badge`, `Card`, `Cluster`, `Grid`, `Input`, `Pagination`, `Skeleton`, `Spacer`, `Stack`, `Table`, `Textarea`, `Timeline`.

### Client-only components

Everything else — anything backed by Radix portals/triggers, hooks, `react-hook-form`, `cmdk`, `vaul`, `sonner`, `react-day-picker`, `input-otp`, or `react-resizable-panels`. Each of those modules ships with its own `"use client"` so importing it from a Server Component still works (Next.js sees the directive at the import boundary).

## What's inside

47 components across primitives (Button, Input, Checkbox, …) and compounds (Combobox, DataTable, Command, …). Every component ships with:

- Radix UI headless foundation where applicable
- CVA variants (`default`, `outline`, `ghost`, etc.)
- Canonical `transition-all duration-200 ease-out`
- HSL design tokens — override via CSS vars, no JS config needed
- A matching `.schema.ts` with AI hints (`whenToUse`, `whenNotToUse`, `commonMistakes`, `accessibilityNotes`, `tokenBudget`)

## Color utilities

Tailwind v4 generates utilities from `@theme {}` automatically. The bundled `tailwind.css` exposes the full semantic palette — use the short class names directly, no `text-[color:var(...)]` workaround required.

| Class | Token |
| --- | --- |
| `bg-background` / `text-background` | `--color-background` |
| `bg-foreground` / `text-foreground` | `--color-foreground` |
| `bg-card` / `text-card-foreground` | `--color-card` / `--color-card-foreground` |
| `bg-popover` / `text-popover-foreground` | `--color-popover` |
| `bg-primary` / `text-primary` / `text-primary-foreground` | `--color-primary` |
| `bg-secondary` / `text-secondary-foreground` | `--color-secondary` |
| `bg-muted` / `text-muted-foreground` | `--color-muted` |
| `bg-accent` / `text-accent-foreground` | `--color-accent` |
| `bg-destructive` / `text-destructive-foreground` | `--color-destructive` |
| `border-input` / `border-border` / `border-ring` | `--color-input` / `--color-border` / `--color-ring` |

Both forms produce identical output:

```tsx
// Preferred — short and stable
<p className="text-muted-foreground">Helper</p>

// Equivalent — only use this if a class name is dynamically composed
<p className="text-[color:var(--color-muted-foreground)]">Helper</p>
```

## Setup: Toaster

```tsx
// app/layout.tsx (Server Component is fine — Toaster declares its own "use client")
import { Toaster } from "@hex-core/components/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

```tsx
// any client component
"use client";
import { toast } from "sonner";

export function SaveButton() {
  return <button onClick={() => toast.success("Saved!")}>Save</button>;
}
```

`sonner` is an optional peer — install it if you use the toaster: `pnpm add sonner`.

## Setup: Form (`react-hook-form` integration)

```tsx
"use client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@hex-core/components/form";
import { Input } from "@hex-core/components/input";
import { Button } from "@hex-core/components/button";

export function ContactForm() {
  const form = useForm<{ email: string }>({ defaultValues: { email: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => console.log(v))} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

`react-hook-form` is an optional peer — install it if you use `<Form>`: `pnpm add react-hook-form`.

## Layout primitives

Don't reach for `<div className="flex …">` — the layout primitives are typed and document their own intent.

| Instead of | Use |
| --- | --- |
| `<div className="flex flex-col gap-4">` | `<Stack gap="4">` |
| `<div className="flex items-center gap-2">` | `<Cluster gap="2">` |
| `<div className="grid grid-cols-3 gap-4">` | `<Grid cols={3} gap="4">` |
| `<div className="max-w-7xl mx-auto px-6">` | `<Container size="xl">` |
| `<div className="h-8" />` | `<Spacer size="8">` |
| `<div className="aspect-video">` | `<AspectRatio ratio={16 / 9}>` |

All layout primitives are RSC-safe — pure visual, zero hooks.

## Card composition

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@hex-core/components/card";

<Card>
  <CardHeader>
    <CardTitle>Quarterly review</CardTitle>
    <CardDescription>Q3 2025 — North America</CardDescription>
  </CardHeader>
  <CardContent>{/* body */}</CardContent>
  <CardFooter>{/* actions */}</CardFooter>
</Card>
```

`Card` and family are RSC-safe.

## Schemas (tooling)

If you're building tooling that consumes the component manifest (an MCP server, a docs prop-table renderer, an AI assistant), import schemas from the dedicated subpath:

```ts
import { buttonSchema, cardSchema } from "@hex-core/components/schemas";
```

The schemas reference `ComponentSchemaDefinition` from `@hex-core/registry`, so install that as a dev dep alongside:

```bash
pnpm add -D @hex-core/registry
```

This entry is intentionally separate from the runtime barrel — `import { Button } from "@hex-core/components"` does NOT pull in registry types.

## Peer dependency matrix

`@hex-core/components` keeps its install footprint small by listing optional dependencies as peers. Install only the ones backing the components you actually use.

| Component | Optional peer to install |
| --- | --- |
| `<Calendar>`, `<DatePicker>` | `react-day-picker`, `date-fns` |
| `<Toaster>`, `toast()` | `sonner` |
| `<Combobox>`, `<MultiCombobox>`, `<Command>` | `cmdk` |
| `<Drawer>` | `vaul` |
| `<InputOTP>` | `input-otp` |
| `<ResizableHandle>`, `<ResizablePanel>`, `<ResizablePanelGroup>` | `react-resizable-panels` |
| `<Form>`, `<FormField>`, `<FormItem>` | `react-hook-form` |
| `<DataTable>` | `@tanstack/react-table` |

Hard peers: `react` 18+/19, `react-dom` 18+/19.

## Docs

Full component catalog, demos, theming, and MCP integration: [hex-core.dev](https://hex-core.dev)

## License

MIT
