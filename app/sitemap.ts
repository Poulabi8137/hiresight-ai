import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return [
    { url: appUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${appUrl}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${appUrl}/auth`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/candidate`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${appUrl}/recruiter`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${appUrl}/upload`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];
}
