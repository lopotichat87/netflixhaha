import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://reelvibe.app'
  
  // Pages statiques principales
  const routes = [
    '',
    '/home',
    '/movies',
    '/browse/series',
    '/trending',
    '/nouveautes',
    '/sagas',
    '/social',
    '/friends',
    '/activity',
    '/auth/login',
    '/auth/signup',
    '/about',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/home' ? 1 : 0.8,
  }))

  return routes
}
