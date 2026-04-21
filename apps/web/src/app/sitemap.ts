import type { MetadataRoute } from "next";
import {
  MARKETING_LAST_UPDATED_ISO,
  absoluteUrl,
  marketingPages,
} from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return marketingPages.map((path) => ({
    url: absoluteUrl(path),
    lastModified: MARKETING_LAST_UPDATED_ISO,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
