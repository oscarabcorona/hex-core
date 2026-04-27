---
"@hex-core/components": minor
---

Fix systemic flat-surface visibility regression across 30 components.

On flat-white surfaces (any consumer page without a Card-elevated wrapper around the demo), components rendered with ~invisible boundaries because token borders (`border-input`, `border-border`) sit at L=90% — 1.27:1 contrast vs `--color-background`. The v1.0.2→v1.1.1 token rollback (#73) intentionally kept borders subtle and relied on shadow elevation from surrounding Card/Popover/Dialog, but that contract only holds when the surrounding surface IS elevated.

This release adds a self-borne shape cue to every affected component using Tailwind v4 `inset-ring` / explicit `-foreground/[opacity]` borders. Token contracts are preserved (`border-input` still applies); the inset ring is additive so components remain subtle on already-elevated surfaces and become visible on flat ones.

Affected:
- Form controls (Type A): Button outline+secondary, Badge secondary+outline, Input, Switch unchecked, Checkbox, RadioGroupItem, Textarea, SelectTrigger, Toggle outline, InputOTPSlot, Combobox trigger, DatePicker trigger, AlertDialogCancel.
- Surface containers (Type B): Card, Dialog, Sheet, Drawer, Popover, DropdownMenu, ContextMenu, Menubar, NavigationMenuViewport, AlertDialog, HoverCard, DataTable wrapper, Alert default, Calendar nav, SelectContent.
- Single-edge dividers (Type C): Accordion, Table (header/row/footer), Tabs (TabsList border), Sidebar, Command (CommandInput border-b).
- Tracks/separators (Type D): Progress, Slider, Separator, ScrollBar thumb, Skeleton, Resizable handle, NavigationMenu indicator, plus dropdown/menubar/context/command/select separator divs.
