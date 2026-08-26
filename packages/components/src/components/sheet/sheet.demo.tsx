"use client";

import {
	Button,
	Input,
	Label,
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@hex-core/components";

const sides = ["top", "right", "bottom", "left"] as const;

/**
 * Sheet demo: four triggers demonstrating slide-in from every edge
 * (top / right / bottom / left) with a shared profile-edit form body.
 */
export function SheetDemo() {
	return (
		<div className="grid grid-cols-2 gap-2">
			{sides.map((side) => (
				<Sheet key={side}>
					<SheetTrigger asChild>
						<Button variant="outline" className="capitalize">
							{side}
						</Button>
					</SheetTrigger>
					<SheetContent side={side}>
						<SheetHeader>
							<SheetTitle>Edit profile</SheetTitle>
							<SheetDescription>
								Make changes and save when done. Enters from the {side}.
							</SheetDescription>
						</SheetHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor={`sheet-name-${side}`}>Name</Label>
								<Input id={`sheet-name-${side}`} defaultValue="Jane Doe" />
							</div>
							<div className="grid gap-2">
								<Label htmlFor={`sheet-email-${side}`}>Email</Label>
								<Input id={`sheet-email-${side}`} defaultValue="jane@example.com" />
							</div>
						</div>
						<SheetFooter>
							<SheetClose asChild>
								<Button>Save changes</Button>
							</SheetClose>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			))}
		</div>
	);
}
