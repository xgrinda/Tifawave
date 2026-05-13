import type { MetadataRoute } from "next";
import { getRooms, getSurfPackages } from "@/lib/content-store";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rooms, surfPackages] = await Promise.all([
    getRooms(),
    getSurfPackages(),
  ]);
  const publishedRooms = rooms.filter((room) => room.available);
  const publishedPackages = surfPackages.filter((item) => item.available);
  const staticRoutes = [
    "",
    "/rooms",
    "/surf-packages",
    "/about",
    "/gallery",
    "/contact",
    "/booking",
  ];
  const detailRoutes = [
    ...publishedRooms.map((room) => `/rooms/${room.slug}`),
    ...publishedPackages.map((surfPackage) => `/surf-packages/${surfPackage.slug}`),
  ];

  return [...staticRoutes, ...detailRoutes].map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
