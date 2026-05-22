import type { Metadata } from "next";
import {
	AppDataTable,
	AppShell,
	AppSidebarNav,
	AppStats,
	Badge,
	Button,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@hex-core/components";

export const metadata: Metadata = {
	title: { absolute: "App — Hex Core" },
	description:
		"Live showcase of the application section blocks composed into a dashboard via the app-page recipe.",
};

const NAV_GROUPS = [
	{
		items: [
			{ label: "Dashboard", href: "#dashboard", active: true },
			{ label: "Reports", href: "#reports" },
			{ label: "Customers", href: "#customers" },
		],
	},
	{
		title: "Workspace",
		items: [
			{ label: "Team", href: "#team" },
			{ label: "Billing", href: "#billing" },
			{ label: "Settings", href: "#settings" },
		],
	},
];

const STATS = [
	{ label: "Revenue", value: "$48.2k", change: "+12%", changeType: "increase" as const },
	{ label: "Active users", value: "12,480", change: "+4%", changeType: "increase" as const },
	{ label: "Churn", value: "1.8%", change: "-0.3%", changeType: "decrease" as const },
	{ label: "Open tickets", value: "37", change: "0%", changeType: "neutral" as const },
];

const ROWS = [
	{ name: "Ada Lovelace", email: "ada@example.com", role: "Owner", status: "Active" },
	{ name: "Alan Turing", email: "alan@example.com", role: "Admin", status: "Active" },
	{ name: "Grace Hopper", email: "grace@example.com", role: "Member", status: "Invited" },
	{ name: "Katherine Johnson", email: "katherine@example.com", role: "Member", status: "Active" },
];

/**
 * Full-bleed showcase of the application section blocks composed into a
 * dashboard in the order the `app-page` recipe declares. Sample content only.
 */
export default function AppShowcasePage() {
	return (
		<AppShell
			sidebar={
				<AppSidebarNav
					brand={<span className="text-lg font-semibold text-foreground">Acme</span>}
					groups={NAV_GROUPS}
					footer={
						<a href="#logout" className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
							Sign out
						</a>
					}
				/>
			}
			header={
				<>
					<h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
					<Button size="sm">New report</Button>
				</>
			}
		>
			<div className="flex flex-col gap-8">
				<AppStats stats={STATS} />

				<AppDataTable
					title="Members"
					description="Manage who has access to this workspace."
					toolbar={
						<>
							<Input placeholder="Search members…" className="w-56" />
							<Button size="sm">Add member</Button>
						</>
					}
					footer={
						<>
							<span className="text-sm text-muted-foreground">4 of 4 members</span>
							<div className="flex gap-2">
								<Button size="sm" variant="outline" disabled>
									Previous
								</Button>
								<Button size="sm" variant="outline" disabled>
									Next
								</Button>
							</div>
						</>
					}
				>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{ROWS.map((row) => (
								<TableRow key={row.email}>
									<TableCell className="font-medium">{row.name}</TableCell>
									<TableCell className="text-muted-foreground">{row.email}</TableCell>
									<TableCell>{row.role}</TableCell>
									<TableCell>
										<Badge variant={row.status === "Active" ? "default" : "secondary"}>
											{row.status}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</AppDataTable>
			</div>
		</AppShell>
	);
}
