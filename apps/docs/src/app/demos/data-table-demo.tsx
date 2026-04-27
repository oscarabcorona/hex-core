"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Badge, DataTable } from "../../components/ui";

interface Payment {
	id: string;
	amount: number;
	status: "pending" | "processing" | "success" | "failed";
	email: string;
}

const data: Payment[] = [
	{ id: "m5gr84i9", amount: 316, status: "success", email: "ken99@yahoo.com" },
	{ id: "3u1reuv4", amount: 242, status: "success", email: "abe45@gmail.com" },
	{
		id: "derv1ws0",
		amount: 837,
		status: "processing",
		email: "monserrat44@yahoo.com",
	},
	{
		id: "5kma53ae",
		amount: 874,
		status: "success",
		email: "silas22@hotmail.com",
	},
	{ id: "bhqecj4p", amount: 721, status: "failed", email: "carmella@qmail.com" },
];

/**
 * DataTable demo: TanStack-driven payment list with a status Badge column and
 * right-aligned currency formatting.
 */
export function DataTableDemo() {
	const columns = useMemo<ColumnDef<Payment>[]>(
		() => [
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => {
					const status = row.getValue<string>("status");
					const variant =
						status === "success"
							? "default"
							: status === "failed"
								? "destructive"
								: "secondary";
					return <Badge variant={variant}>{status}</Badge>;
				},
			},
			{ accessorKey: "email", header: "Email" },
			{
				accessorKey: "amount",
				header: () => <div className="text-right">Amount</div>,
				cell: ({ row }) => {
					const amount = row.getValue<number>("amount");
					const formatted = new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "USD",
					}).format(amount);
					return <div className="text-right font-medium">{formatted}</div>;
				},
			},
		],
		[],
	);

	return (
		<div className="w-full max-w-2xl">
			<DataTable
				columns={columns}
				data={data}
				caption="Recent payments by status, email, and amount."
			/>
		</div>
	);
}
