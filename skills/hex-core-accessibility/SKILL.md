---
name: hex-core-accessibility
description: Accessibility patterns for hex-core components. Load when the user asks about a11y, aria-label, screen reader, keyboard navigation, focus management, or WCAG compliance with hex-core.
---

# Hex Core — Accessibility

Hex Core components wrap Radix UI primitives, so most accessibility behavior (roles, keyboard nav, focus traps) is Radix's. The hex-core layer adds styling and a few conventions.

## What Radix handles automatically

- **Focus management**: dialogs, popovers, dropdowns trap focus and return it on close.
- **ARIA roles and states**: `role="dialog"`, `aria-expanded`, `aria-selected`, `aria-checked`, `aria-describedby` on form controls.
- **Keyboard**: Escape closes overlays, arrow keys navigate menus and select content, Enter/Space activates buttons, Tab cycles focusable elements.
- **Typeahead**: `Select` and `Command` support typeahead out of the box.

## What you must do

### 1. Icon-only buttons need `aria-label`

```tsx
// ❌ WRONG
<Button variant="outline" size="icon"><SettingsIcon /></Button>

// ✅ RIGHT
<Button variant="outline" size="icon" aria-label="Settings"><SettingsIcon /></Button>
```

The component won't warn — the CSS doesn't care — but a screen reader announces "button" with no label.

### 2. Inputs need a matching `Label`

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

Or via `Form` composition (FormLabel auto-wires htmlFor):
```tsx
<FormField name="email" render={({ field }) => (
  <FormItem>
    <FormLabel>Email</FormLabel>
    <FormControl><Input {...field} /></FormControl>
  </FormItem>
)} />
```

### 3. AlertDialog is for irreversible actions

Dialog and AlertDialog differ in semantics. AlertDialog sets `role="alertdialog"` and forces focus to Cancel by default. Use it for delete/destroy. Use plain Dialog for informational modals.

```tsx
<AlertDialogCancel>Cancel</AlertDialogCancel>   // focused by default — good default
<AlertDialogAction onClick={deleteAccount}>Delete</AlertDialogAction>
```

### 4. Sheet / Drawer close buttons need labels

```tsx
<SheetContent>
  <SheetHeader>
    <SheetTitle>Edit profile</SheetTitle>
  </SheetHeader>
  {/* Close button is auto-inserted with "Close" aria-label */}
</SheetContent>
```

Radix supplies the close button; don't add a second one.

### 5. Toggle vs Switch vs Checkbox

- **Toggle** — for toolbar-style buttons (bold, italic). Doesn't submit form data.
- **Switch** — for instant settings (notifications on/off). Immediate effect.
- **Checkbox** — for form-submittable booleans. Requires Submit.

Using the wrong one gives the wrong ARIA role and confuses screen readers.

### 6. Sonner toasts are announcements

`aria-live="polite"` by default. For critical alerts that interrupt, use Alert or AlertDialog instead.

## Keyboard shortcuts by primitive

| Component | Keys |
|---|---|
| Button | Enter, Space |
| Select | Arrow Up/Down, Home, End, typeahead, Esc |
| Dialog / Sheet | Esc to close, Tab cycles within |
| DropdownMenu | Arrow Up/Down, Enter, Esc, typeahead |
| Command | Arrow Up/Down, Enter, Esc |
| RadioGroup | Arrow keys cycle, Space/Enter selects |
| Tabs | Arrow Left/Right, Home, End |
| Accordion | Arrow Up/Down, Home, End, Enter/Space toggle |

## Colors + contrast

The three shipped themes (`default`, `midnight`, `ember`) pass WCAG AA for `background` / `foreground` and `primary` / `primary-foreground` pairs. If you fork a theme, re-check your pairs — the CLI doesn't enforce it. Tool: https://webaim.org/resources/contrastchecker/

## When in doubt

Every `.schema.ts` file has an `ai.accessibilityNotes` field with component-specific guidance. Call `get_component_schema({name})` and read that field before shipping.
