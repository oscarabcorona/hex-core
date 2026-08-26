"use client";

import { useState } from "react";
import {
	Button,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@hex-core/components";

/**
 * Drawer demo: two triggers — a destructive confirm pattern and a cookie-style
 * bottom drawer. Both support drag-to-dismiss (vaul) and a Cancel action.
 */
export function DrawerDemo() {
	const [goal, setGoal] = useState(350);

	return (
		<div className="flex flex-wrap gap-2">
			<Drawer>
				<DrawerTrigger asChild>
					<Button variant="outline">Delete account</Button>
				</DrawerTrigger>
				<DrawerContent>
					<div className="mx-auto w-full max-w-sm">
						<DrawerHeader>
							<DrawerTitle>Are you sure?</DrawerTitle>
							<DrawerDescription>
								This action cannot be undone. Your account will be permanently deleted.
							</DrawerDescription>
						</DrawerHeader>
						<DrawerFooter>
							<Button variant="destructive">Delete</Button>
							<DrawerClose asChild>
								<Button variant="outline">Cancel</Button>
							</DrawerClose>
						</DrawerFooter>
					</div>
				</DrawerContent>
			</Drawer>

			<Drawer>
				<DrawerTrigger asChild>
					<Button variant="outline">Set daily goal</Button>
				</DrawerTrigger>
				<DrawerContent>
					<div className="mx-auto w-full max-w-sm">
						<DrawerHeader>
							<DrawerTitle>Move goal</DrawerTitle>
							<DrawerDescription>
								Set your daily activity goal. Drag down or tap outside to dismiss.
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex items-center justify-center gap-6 px-4 py-8">
							<Button
								variant="outline"
								size="icon"
								aria-label="Decrease goal"
								onClick={() => setGoal((g) => Math.max(100, g - 50))}
							>
								−
							</Button>
							<div className="text-center">
								<div className="text-6xl font-bold tracking-tighter">{goal}</div>
								<div className="text-xs uppercase text-muted-foreground">
									calories / day
								</div>
							</div>
							<Button
								variant="outline"
								size="icon"
								aria-label="Increase goal"
								onClick={() => setGoal((g) => Math.min(600, g + 50))}
							>
								+
							</Button>
						</div>
						<DrawerFooter>
							<Button>Submit</Button>
							<DrawerClose asChild>
								<Button variant="outline">Cancel</Button>
							</DrawerClose>
						</DrawerFooter>
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
