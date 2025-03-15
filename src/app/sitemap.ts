import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapRoutes: MetadataRoute.Sitemap = [
    {
      url: '', // home
      changeFrequency: 'daily',
      priority: 1,
    },
    // {
    //     url: 'tools', // tools
    //     lastModified: new Date(),
    //     changeFrequency: 'daily',
    //     priority: 0.9,
    //   },
    {
      url: 'category', // category
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
        url: 'article', // article
        lastModified: new Date("2025-03-15 13:13:00"),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: 'privacy-policy', // privacy-policy
        lastModified: new Date("2025-03-15 13:13:00"),
        changeFrequency: 'daily',
        priority: 0.5,
      },
      {
        url: 'terms-of-service', // terms-of-service
        lastModified: new Date("2025-03-15 13:13:00"),
        changeFrequency: 'daily',
        priority: 0.5,
      },
      {
        url: 'about', // about
        lastModified: new Date("2025-03-15 13:13:00"),
        changeFrequency: 'daily',
        priority: 0.7,
      },
  ];

  const sitemapData = sitemapRoutes.flatMap((route) => {
    const routeUrl = route.url === '' ? '' : `/${route.url}`;
    return {
        ...route,
        url: `https://humanbenchmark.app${routeUrl}`,
      };
    }
  );

  return sitemapData;
}
