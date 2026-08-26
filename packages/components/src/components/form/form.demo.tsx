"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Button,
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from "@hex-core/components";

const formSchema = z.object({
	username: z
		.string()
		.min(2, { message: "Username must be at least 2 characters." })
		.max(30, { message: "Username must be 30 characters or fewer." }),
	email: z.string().email({ message: "Enter a valid email address." }),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Form demo: two-field profile form with zod validation, per-field error
 * display, helper text, and a `loading` Button while react-hook-form is
 * submitting.
 */
export function FormDemo() {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { username: "", email: "" },
	});

	async function onSubmit(values: FormValues) {
		await new Promise<void>((resolve) => setTimeout(resolve, 800));
		window.alert(`Submitted: ${JSON.stringify(values, null, 2)}`);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex w-full max-w-sm flex-col gap-6"
				noValidate
			>
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="shadcn" {...field} />
							</FormControl>
							<FormDescription>Your public display name.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" placeholder="you@example.com" {...field} />
							</FormControl>
							<FormDescription>We&apos;ll never share your email.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" loading={form.formState.isSubmitting}>
					{form.formState.isSubmitting ? "Submitting…" : "Submit"}
				</Button>
			</form>
		</Form>
	);
}
