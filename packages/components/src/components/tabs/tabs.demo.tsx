import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@hex-core/components";

/**
 * Tabs demo: Account / Password tabs composing Card + form fields,
 * showing the canonical "settings panel" pattern.
 */
export function TabsDemo() {
	return (
		<Tabs defaultValue="account" className="w-full max-w-md">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<Card>
					<CardHeader>
						<CardTitle>Account</CardTitle>
						<CardDescription>
							Update your account details. Changes save when you click the button.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-1">
							<Label htmlFor="tabs-name">Name</Label>
							<Input id="tabs-name" defaultValue="Oscar Corona" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="tabs-handle">Username</Label>
							<Input id="tabs-handle" defaultValue="@oscarabcorona" />
						</div>
					</CardContent>
					<CardFooter>
						<Button>Save changes</Button>
					</CardFooter>
				</Card>
			</TabsContent>
			<TabsContent value="password">
				<Card>
					<CardHeader>
						<CardTitle>Password</CardTitle>
						<CardDescription>
							You&apos;ll be signed out of other devices after changing your password.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-1">
							<Label htmlFor="tabs-current">Current password</Label>
							<Input id="tabs-current" type="password" />
						</div>
						<div className="space-y-1">
							<Label htmlFor="tabs-new">New password</Label>
							<Input id="tabs-new" type="password" />
						</div>
					</CardContent>
					<CardFooter>
						<Button>Update password</Button>
					</CardFooter>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
