import { getCollection } from 'astro:content';
import { siteConfig } from '../lib/config/site';

export async function GET() {
  const posts = await getCollection('posts', ({ data }) => !data.draft && !data.hide);
  const baseUrl = siteConfig.url;

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' as const },
    { url: '/posts/', priority: '0.9', changefreq: 'daily' as const },
  ];

  const postPages = posts.map(post => ({
    url: `/posts/${post.slug}/`,
    priority: '0.8',
    changefreq: 'weekly' as const,
    lastmod: post.data.updated || post.data.published,
  }));

  const allPages = [...staticPages, ...postPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600',
    },
  });
}
