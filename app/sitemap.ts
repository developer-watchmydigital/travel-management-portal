import { MetadataRoute } from "next";
import { initialCuratedPackages } from "@/lib/initialData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://travel.watchmydigital.com";

  // Core static landing route
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Curated tour packages dynamic routes
  const packageRoutes: MetadataRoute.Sitemap = initialCuratedPackages.map((pkg) => ({
    url: `${baseUrl}/packages/${pkg.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...packageRoutes];
}
