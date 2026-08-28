import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

/** robots.txt — allow-all with a pointer to the dynamic sitemap. */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: "*", allow: "/" }],
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
