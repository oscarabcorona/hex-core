import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
} from "@hex-core/components";

/**
 * AlertDialog is scoped to destructive confirmations. Two variants:
 * a severe account-level action (Delete account) and an admin-level
 * irreversible action (Revoke access). Non-destructive confirms should
 * use `<Dialog>` instead — see the Dialog demo.
 */
export function AlertDialogDemo() {
	return (
		<div className="grid w-full max-w-md gap-4">
			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Delete account
				</p>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="destructive">Delete account</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your
								account and remove your data from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction>Yes, delete</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			<div>
				<p className="mb-2 text-xs font-medium text-muted-foreground">
					Revoke access
				</p>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="outline">Revoke team access</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Revoke access for @oscarabcorona?</AlertDialogTitle>
							<AlertDialogDescription>
								They&apos;ll lose access to every project in this team immediately and
								will need a new invitation to rejoin.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction>Revoke</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
