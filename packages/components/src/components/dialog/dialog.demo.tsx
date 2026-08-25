"use client";

import { useState } from "react";
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
} from "@hex-core/components";

const SHARE_LINK = "https://hex-core.dev/share/abc123";

/**
 * Dialog patterns: edit-profile form and a share-link pattern with a
 * read-only Input, a clipboard-wired Copy button, and a Done close.
 */
export function DialogDemo() {
	const [copied, setCopied] = useState(false);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(SHARE_LINK);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// clipboard unavailable (insecure context / denied permission) — leave label unchanged
		}
	}

	return (
		<div className="grid w-full max-w-md gap-4">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Form</p>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline">Edit profile</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit profile</DialogTitle>
							<DialogDescription>
								Make changes to your profile. Click save when you&apos;re done.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-2">
							<div className="grid gap-1.5">
								<Label htmlFor="dlg-name">Name</Label>
								<Input id="dlg-name" defaultValue="Oscar Corona" />
							</div>
							<div className="grid gap-1.5">
								<Label htmlFor="dlg-username">Username</Label>
								<Input id="dlg-username" defaultValue="@oscarabcorona" />
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button type="submit">Save changes</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">Share link</p>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline">Share</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Share link</DialogTitle>
							<DialogDescription>
								Anyone with this link can view the project.
							</DialogDescription>
						</DialogHeader>
						<div className="flex items-center gap-2">
							<div className="grid flex-1 gap-1.5">
								<Label htmlFor="share-link" className="sr-only">
									Link
								</Label>
								<Input id="share-link" defaultValue={SHARE_LINK} readOnly />
							</div>
							<Button size="sm" onClick={copyLink}>
								{copied ? "Copied" : "Copy"}
							</Button>
							{/* Sibling live region announces the transient state crisply without
							    doubling the button's own accessible name. */}
							<span className="sr-only" aria-live="polite">
								{copied ? "Link copied to clipboard" : ""}
							</span>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Done</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
