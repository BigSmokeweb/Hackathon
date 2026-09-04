import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/provider/portal/private/', '/admin/'],
    },
    sitemap: 'https://experienceplatform.in/sitemap.xml',
  };
}
