import type { MetadataRoute } from "next";

const BASE_URL = 'https://humanbenchmark.app/';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tests/gyroscope-balance",".webp$","woff2$","woff$","ttf$","eot$","svg$"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
