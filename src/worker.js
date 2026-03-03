/**
 * Cloudflare Worker for serving Next.js static assets and HTML files
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.ASSETS) {
      return new Response('Service unavailable', { status: 503 });
    }

    // Handle special routes with specific content types
    if (url.pathname === '/robots.txt') {
      const robotsContent = `User-agent: *
Allow: /
Crawl-delay: 1

Sitemap: https://quizbase.app/sitemap.xml
Host: https://quizbase.app`;

      return new Response(robotsContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    if (url.pathname === '/sitemap.xml') {
      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://quizbase.app</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://quizbase.app/join</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://quizbase.app/login</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://quizbase.app/discover</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://quizbase.app/analytics</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://quizbase.app/legal</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://quizbase.app/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://quizbase.app/impressum</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://quizbase.app/datenschutz</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://quizbase.app/design</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

      return new Response(sitemapContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Try to serve the requested asset directly first
    try {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        // Fix MIME type for JavaScript files
        if (url.pathname.endsWith('.js')) {
          return new Response(assetResponse.body, {
            status: assetResponse.status,
            headers: {
              ...Object.fromEntries(assetResponse.headers.entries()),
              'Content-Type': 'application/javascript; charset=utf-8',
            },
          });
        }
        return assetResponse;
      }
    } catch {
      // Asset fetch failed; fall through to path handling below
    }

    // For dynamic routes, try to serve the HTML file directly
    // This handles routes like /presenter/edit/[pollId] and /presenter/[sessionId]
    if (url.pathname !== '/') {
      try {
        // Remove trailing slash for consistency (except for root)
        const cleanPath = url.pathname.replace(/\/$/, '') || '/';
        
        // Try to fetch the HTML file for this specific path
        const htmlPath = cleanPath === '/' ? '/index.html' : `${cleanPath}.html`;
        const htmlUrl = new URL(htmlPath, url);
        const htmlRequest = new Request(htmlUrl.toString(), {
          method: request.method,
          headers: request.headers,
        });
        
        const htmlResponse = await env.ASSETS.fetch(htmlRequest);
        if (htmlResponse.status === 200) {
          return htmlResponse;
        }
      } catch {
        // HTML fetch failed; fall through to SPA fallback below
      }
    }

    // SPA fallback: serve index.html for client-side routing
    try {
      const indexUrl = new URL('/', url);
      const fallbackRequest = new Request(indexUrl.toString(), {
        method: request.method,
        headers: request.headers,
      });
      const fallbackResponse = await env.ASSETS.fetch(fallbackRequest);
      if (fallbackResponse.status === 200) {
        return new Response(fallbackResponse.body, {
          status: 200,
          headers: fallbackResponse.headers,
        });
      }
    } catch {
      // Fallback fetch failed; return 404 below
    }

    return new Response('Not Found', { status: 404 });
  }
};
