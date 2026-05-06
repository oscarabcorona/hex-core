---
name: hex-core-anti-patterns
description: Top mistakes to avoid with hex-core. Load when writing React 19, editing components/ui/, handling forms, composing dialogs, or anywhere an agent is about to make a known-bad choice.
---

# Hex Core — Anti-Patterns

These are the repeated mistakes across real hex-core projects. Most come from the `.ai.commonMistakes` field on the underlying components; this skill aggregates and contextualizes them.

## React 19 / Next 16 hygiene

### Do not add `forwardRef` to new components

React 19 makes `ref` a regular prop. New hex-core components omit `forwardRef`. Legacy code keeping it is fine during migration, but don't add it to new code.

```tsx
// ❌ WRONG (React 19)
const MyCard = forwardRef<HTMLDivElement, Props>((props, ref) => <div ref={ref} {...props} />);

// ✅ RIGHT
function MyCard({ ref, ...props }: Props & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} {...props} />;
}
```

### Do not put `"use client"` at the page level

Push the client boundary as deep as possible. A Server Component page can render a client `<Demo />` without itself being client. If only the search input needs useState, mark only the search input.

```tsx
// ❌ WRONG
"use client";
export default function Page() { return <div>...with one button that uses onClick</div>; }

// ✅ RIGHT
export default function Page() { return <div><ClientButton /></div>; }  // ClientButton has "use client"
```

### `params` and `searchParams` are async in Next 16

```tsx
// ❌ WRONG (Next 15 and earlier)
export default function Page({ params }: { params: { slug: string } }) { const { slug } = params; }

// ✅ RIGHT (Next 16)
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}
```

## Component composition

### Slots over prop branching

```tsx
// ❌ WRONG — grows unbounded
<Card header="Title" headerIcon={icon} showDivider={true} footer={...} />

// ✅ RIGHT — compose with children
<Card>
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <Separator />
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

### Don't nest interactive inside `asChild`

```tsx
// ❌ WRONG
<Button asChild>
  <a href="/link">
    <span onClick={handleClick}>...</span>  {/* two click handlers, one wins */}
  </a>
</Button>

// ✅ RIGHT — one interactive element
<Button asChild>
  <a href="/link">Label</a>
</Button>
```

### `destructive` variant is for actually destructive actions

Red buttons signal danger. Using `variant="destructive"` for a generic "Submit" destroys the signal. Reserve for delete, archive, drop, end-session.

## Forms

### Spread `{...field}` into FormControl

```tsx
// ❌ WRONG — value/onChange not wired
<FormField name="email" render={({ field }) => (
  <FormItem><FormControl><Input /></FormControl></FormItem>
)} />

// ✅ RIGHT
<FormField name="email" render={({ field }) => (
  <FormItem><FormControl><Input {...field} /></FormControl></FormItem>
)} />
```

### Use Zod resolver for typed validation

```tsx
const form = useForm<LoginFields>({
  resolver: zodResolver(loginSchema),   // ← don't omit
  defaultValues: {...}
});
```

### FormLabel must be inside FormItem

FormLabel's `htmlFor` is wired through FormItem context. Outside FormItem, it loses the control id.

## Overlays

### Dialog vs AlertDialog — pick the right one

- **AlertDialog** = irreversible action confirmation. Forces Cancel focus. `role="alertdialog"`.
- **Dialog** = informational, form input, multi-step. Normal focus.

Using Dialog for a delete-confirm is semantically wrong — screen readers won't announce urgency.

### Sheet / Drawer / Dialog are not interchangeable

- **Dialog**: modal over main content, escape + outside-click closes
- **Sheet**: slides in from edge, persistent-feeling
- **Drawer**: bottom-up mobile-first, swipe to dismiss
- **Popover**: anchored to a trigger, not modal

## Data display

### Select → Combobox when list > ~15 items

Select has no search. Combobox is Command + Popover with search. Cross the threshold and switch.

### Not every list needs DataTable

DataTable implies sort + filter + pagination. A 10-item read-only list is just a `<ul>`. Don't pay the complexity cost for under 20 rows.

## Meta

### Don't edit `packages/components/` from consumer code

The copy-the-code model means you own the `components/ui/` files in your project. Edit *those*. Don't monkey-patch the upstream package.

### Don't skip `verify_checklist` after a non-recipe install

If you installed component-by-component via MCP `get_component`, the agent doesn't automatically know about internal dep chains. Run `verify_checklist` as the final step to catch `combobox` without `command`.
