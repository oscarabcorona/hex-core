import {
	Badge,
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@hex-core/components";

/**
 * Table demo: invoice list with a Badge-styled status column, right-aligned
 * amounts, a TableFooter totalling the balance, and a caption.
 */
export function TableDemo() {
	type Invoice = {
		invoice: string;
		status: "Paid" | "Pending" | "Unpaid";
		method: string;
		amount: number;
	};

	const invoices: Invoice[] = [
		{ invoice: "INV001", status: "Paid", method: "Credit Card", amount: 250 },
		{ invoice: "INV002", status: "Pending", method: "PayPal", amount: 150 },
		{ invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: 350 },
		{ invoice: "INV004", status: "Paid", method: "Credit Card", amount: 450 },
	];

	const statusVariant: Record<Invoice["status"], "default" | "secondary" | "destructive"> = {
		Paid: "default",
		Pending: "secondary",
		Unpaid: "destructive",
	};

	const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
	const total = invoices.reduce((sum, i) => sum + i.amount, 0);

	return (
		<Table>
			<TableCaption>A list of your recent invoices.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[100px]">Invoice</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Method</TableHead>
					<TableHead className="text-right">Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{invoices.map((inv) => (
					<TableRow key={inv.invoice}>
						<TableCell className="font-medium">{inv.invoice}</TableCell>
						<TableCell>
							<Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
						</TableCell>
						<TableCell>{inv.method}</TableCell>
						<TableCell className="text-right">{fmt.format(inv.amount)}</TableCell>
					</TableRow>
				))}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell colSpan={3}>Total</TableCell>
					<TableCell className="text-right">{fmt.format(total)}</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
}
