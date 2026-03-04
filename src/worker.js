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

Sitemap: https://quizbase.xn--schchner-2za.de/sitemap.xml
Host: https://quizbase.xn--schchner-2za.de`;

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
    <loc>https://quizbase.xn--schchner-2za.de</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/join</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/login</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/discover</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/analytics</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/legal</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/impressum</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/datenschutz</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://quizbase.xn--schchner-2za.de/design</loc>
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

    // For dynamic routes, check HTML files FIRST before trying generic assets
    // This prevents serving JS files instead of HTML for dynamic routes
    if (url.pathname !== '/') {
      try {
        // Remove trailing slash for consistency (except for root)
        const cleanPath = url.pathname.replace(/\/$/, '') || '/';

        // For dynamic routes, we need to match the Next.js build pattern
        // Next.js static export creates folders with page.html inside
        let htmlPath;

        const parts = cleanPath.split('/').filter(Boolean);

        if (cleanPath === '/') {
          htmlPath = '/index.html';
        } else if (parts[0] === 'presenter') {
          if (parts[1] === 'edit' && parts.length >= 3) {
            // /presenter/edit/[pollId]
            htmlPath = `/presenter/edit/[pollId]/page.html`;
          } else if (parts.length >= 3 && parts[2] === 'stats') {
            // /presenter/[sessionId]/stats
            htmlPath = `/presenter/[sessionId]/stats/page.html`;
          } else if (parts.length >= 2) {
            // /presenter/[sessionId]
            htmlPath = `/presenter/[sessionId]/page.html`;
          }
        } else if (parts[0] === 'p' && parts.length >= 2) {
          // /p/[sessionId]
          htmlPath = `/p/[sessionId]/page.html`;
        } else if (parts[0] === 'profile' && parts.length >= 2) {
          // /profile/[userId]
          htmlPath = `/profile/[userId]/page.html`;
        } else {
          // For most routes, try path.html directly (Next.js export style)
          htmlPath = `${cleanPath}.html`;
        }

        if (htmlPath) {
          const htmlUrl = new URL(htmlPath, url);
          const htmlRequest = new Request(htmlUrl.toString(), {
            method: request.method,
            headers: request.headers,
          });

          let htmlResponse = await env.ASSETS.fetch(htmlRequest);

          // If path.html failed, try path/page.html (the old way)
          if (htmlResponse.status !== 200 && cleanPath !== '/') {
            const altPath = `${cleanPath}/page.html`;
            const altUrl = new URL(altPath, url);
            htmlResponse = await env.ASSETS.fetch(new Request(altUrl.toString(), {
              method: request.method,
              headers: request.headers,
            }));
          }

          if (htmlResponse.status === 200) {
            return htmlResponse;
          }
        }
      } catch {
        // HTML fetch failed; fall through to asset handling below
      }
    }

    // Try to serve the requested asset directly
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
      // Asset fetch failed; fall through to SPA fallback below
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
      // Fallback fetch failed; return 404
    }

    return new Response('Not Found', { status: 404 });
  }
};
