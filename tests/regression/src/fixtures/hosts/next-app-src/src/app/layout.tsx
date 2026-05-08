import type { ReactNode } from "react";

/** Root layout — minimal scaffold for the regression suite. Tests assert
 * additions (Toaster mount, etc.) against this baseline. */
export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
