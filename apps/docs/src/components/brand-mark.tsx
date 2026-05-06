import Link from "next/link";
import { cn } from "../lib/utils";

type BrandSize = "sm" | "md" | "lg";

const NAME_SIZE: Record<BrandSize, string> = {
	sm: "text-base",
	md: "text-base",
	lg: "text-lg",
};

const VERSION_LABEL = "v0.1";

/**
 * Brand wordmark + version chip — the "Hex Core v0.1" block used across the
 * docs chrome (landing header, docs shell, docs header, mobile nav).
 */
export function BrandMark({
	size = "md",
	className,
}: {
	size?: BrandSize;
	className?: string;
}) {
	return (
		<Link
			href="/"
			aria-label="Home"
			className={cn("flex min-w-0 items-center gap-2", className)}
		>
			<span className={cn("truncate font-bold tracking-tight", NAME_SIZE[size])}>Hex Core</span>
			<span className="shrink-0 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
				{VERSION_LABEL}
			</span>
		</Link>
	);
}
