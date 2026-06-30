import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/expert", "/api"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
