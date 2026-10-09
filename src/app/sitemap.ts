import type { MetadataRoute } from "next";
import { pages } from "@/content/pages";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/signup", "/login", ...pages.map((page) => `/${page.slug}`)];
  return paths.map((path) => ({ url: `${site.url}${path}`, lastModified: new Date() }));
}
