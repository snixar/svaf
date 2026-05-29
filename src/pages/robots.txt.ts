import { siteConfig } from '../lib/config/site';

export async function GET() {
  const body = [
    '# AI crawlers (best-effort — real protection at CDN level)',
    'User-agent: GPTBot',
    'Disallow: /',
    'User-agent: ChatGPT-User',
    'Disallow: /',
    'User-agent: Claude-Web',
    'Disallow: /',
    'User-agent: anthropic-ai',
    'Disallow: /',
    'User-agent: Google-Extended',
    'Disallow: /',
    'User-agent: CCBot',
    'Disallow: /',
    'User-agent: FacebookBot',
    'Disallow: /',
    'User-agent: Omgilibot',
    'Disallow: /',
    'User-agent: Amazonbot',
    'Disallow: /',
    'User-agent: Bytespider',
    'Disallow: /',
    'User-agent: PerplexityBot',
    'Disallow: /',
    'User-agent: YouBot',
    'Disallow: /',
    'User-agent: Diffbot',
    'Disallow: /',
    'User-agent: ImagesiftBot',
    'Disallow: /',
    'User-agent: cohere-ai',
    'Disallow: /',
    '',
    '# All other crawlers',
    'User-agent: *',
    'Disallow: /',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
