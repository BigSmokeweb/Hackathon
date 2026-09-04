import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://experienceplatform.in';
  const cities = ['ahmedabad', 'mumbai', 'jaipur'];
  const categories = ['FOOD', 'CULTURE', 'WORKSHOPS', 'ADVENTURE', 'HIDDEN_GEMS', 'NIGHTLIFE'];

  const cityEntries = cities.map((city) => ({
    url: `${baseUrl}/cities/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const categoryEntries = categories.map((cat) => ({
    url: `${baseUrl}/explore?cat=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...cityEntries,
    ...categoryEntries,
  ];
}
