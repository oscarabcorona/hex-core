import type { ComponentSchemaDefinition } from "@hex-core/registry";

export const formSchema: ComponentSchemaDefinition = {
	name: "form",
	displayName: "Form",
	description:
		"A form primitive built on react-hook-form + zod. Provides Form/FormField/FormItem/FormLabel/FormControl/FormDescription/FormMessage with automatic aria wiring and error display.",
	category: "component",
	subcategory: "forms",
	props: [],
	variants: [],
	slots: [
		{
			name: "children",
			description: "FormField + FormItem subtrees",
			required: true,
			acceptedTypes: ["ReactNode"],
		},
	],
	dependencies: {
		npm: [
			"react-hook-form",
			"@hookform/resolvers",
			"zod",
			"@radix-ui/react-label",
			"@radix-ui/react-slot",
			"clsx",
			"tailwind-merge",
		],
		internal: ["primitives/label/label"],
		peer: ["react", "react-dom"],
	},
	tokensUsed: ["destructive", "muted-foreground"],
	examples: [
		{
			title: "Zod-validated form",
			description: "Username form with react-hook-form + zod",
			code: 'import { zodResolver } from "@hookform/resolvers/zod";\nimport { useForm } from "react-hook-form";\nimport { z } from "zod";\n\nconst formSchema = z.object({\n  username: z.string().min(2, "Username must be at least 2 characters"),\n});\n\nfunction ProfileForm() {\n  const form = useForm({\n    resolver: zodResolver(formSchema),\n    defaultValues: { username: "" },\n  });\n\n  return (\n    <Form {...form}>\n      <form onSubmit={form.handleSubmit((values) => console.log(values))} className="space-y-6">\n        <FormField\n          control={form.control}\n          name="username"\n          render={({ field }) => (\n            <FormItem>\n              <FormLabel>Username</FormLabel>\n              <FormControl><Input placeholder="shadcn" {...field} /></FormControl>\n              <FormDescription>Your public display name.</FormDescription>\n              <FormMessage />\n            </FormItem>\n          )}\n        />\n        <Button type="submit">Submit</Button>\n      </form>\n    </Form>\n  );\n}',
		},
	],
	ai: {
		whenToUse:
			"Use for any form that needs validation, per-field errors, and accessible aria-describedby/aria-invalid wiring. Pair with zod schemas via @hookform/resolvers/zod.",
		whenNotToUse:
			"Don't use for trivial single-input forms that don't need validation (render a plain Input + Button). Don't use for server actions forms in Next.js 16 (consider useActionState + useFormStatus instead).",
		commonMistakes: [
			"Forgetting to spread {...field} into the form control (connects value/onChange)",
			"Putting FormLabel outside FormItem (loses htmlFor wiring)",
			"Using useForm without a resolver when zod validation is desired",
			"Calling form.handleSubmit without a callback",
		],
		relatedComponents: ["input", "textarea", "select", "checkbox", "radio-group", "switch"],
		accessibilityNotes:
			"FormControl automatically wires id, aria-describedby, and aria-invalid. FormLabel uses htmlFor matching the control id. Errors are announced via FormMessage with matching aria-describedby.",
		tokenBudget: 900,
	},
	tags: ["form", "react-hook-form", "zod", "validation", "field"],
};
