---
"@hex-core/components": minor
---

feat(components): per-component bundle split + RSC-safe deep imports

Refactor `@hex-core/components` from a single 365 KB client-only bundle into
per-component ESM files. New deep-import path (`@hex-core/components/<name>`)
ships the bare minimum for each component and preserves the file's
`"use client"` directive (or its absence) so consumers can render visual
primitives in Server Components.

**RSC-safe (no `"use client"`):** `Alert`, `Badge`, `Card`, `Cluster`, `Grid`,
`Input`, `Pagination`, `Skeleton`, `Spacer`, `Stack`, `Table`, `Textarea`,
`Timeline` — render directly in Next.js Server Components without forcing
the subtree client-side.

**Client-only (preserves `"use client"`):** Everything that touches a Radix
primitive, a hook, `react-hook-form`, `cmdk`, `vaul`, `sonner`,
`react-day-picker`, `input-otp`, or `react-resizable-panels`.

```ts
// RSC-safe — page can stay a Server Component
import { Badge } from "@hex-core/components/badge";
import { Card, CardContent } from "@hex-core/components/card";

// Client-only — module declares "use client"
import { Dialog } from "@hex-core/components/dialog";
import { Form } from "@hex-core/components/form";
```

The barrel `import { Button } from "@hex-core/components"` keeps working but
is now marked client (it inlines stateful re-exports), so prefer deep
imports when targeting RSC.

**Tree-shake unblocked.** `"sideEffects": false` + per-component output
means using 9 components no longer pulls in the other 38.

**Optional peers (was: dependencies).** `cmdk`, `vaul`, `sonner`,
`input-otp`, `react-day-picker`, `react-resizable-panels`, `date-fns`,
`react-hook-form`, `@tanstack/react-table` are now optional peers — install
only the ones backing the components you use. See README "Peer dependency
matrix" for the full table.

**Why minor, not major:** the barrel import API is unchanged and
shape-compatible. Consumers using only deep imports see no breakage.

**⚠ Runtime-crash risk for transitive consumers:** if you previously used
`<Calendar>`, `<DatePicker>`, `<Toaster>`, `<Combobox>`, `<Drawer>`,
`<InputOTP>`, `<Resizable*>`, `<Form>`, or `<DataTable>` WITHOUT
explicitly adding the backing peer to your `package.json`, those
components will throw `Cannot find module 'react-day-picker'` (or
`'sonner'`, `'cmdk'`, etc.) at first render after upgrading. Install the
listed peer per the README "Peer dependency matrix" before upgrading. We
considered shipping this as `2.0.0` for strict semver, but landed on
minor because the contract that's changing was implicit (transitive)
rather than declared.

**Schema re-exports moved.** `buttonSchema`, `cardSchema`, etc. are no
longer on the runtime barrel — they live at
`@hex-core/components/schemas` so the barrel's TypeScript surface no
longer references `@hex-core/registry`. Tooling (MCP, CLI, docs prop
tables) imports schemas from the new entry; `@hex-core/registry` becomes
a dev-time install for those consumers only.

**Migration:** none required for component imports. If you imported
`buttonSchema` (or any other `*Schema`) from `@hex-core/components`,
switch to `@hex-core/components/schemas`. To unlock RSC + tree-shake,
switch barrel component imports to deep imports
(`@hex-core/components/<name>`). To silence peer warnings, install the
optional peers backing the components you use (see README table).
