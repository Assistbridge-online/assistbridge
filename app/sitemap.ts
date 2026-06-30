import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { DISCIPLINES } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();
  const staticRoutes = [
    "",
    "/services",
    "/disciplines",
    "/how-it-works",
    "/pricing",
    "/about",
    "/contact",
    "/faq",
    "/become-an-expert",
    "/experts",
    "/blog",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
    "/refund",
    "/cookies",
  ];
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
  const disciplineEntries: MetadataRoute.Sitemap = DISCIPLINES.map((d) => ({
    url: `${base}/disciplines/${d.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...staticEntries, ...disciplineEntries];
}
