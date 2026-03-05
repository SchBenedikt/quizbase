/**
 * Cloudflare Worker for serving Next.js static assets and HTML files
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.ASSETS) {
      return new Response('Service unavailable', { status: 503 });
    }

    const isRSC = url.searchParams.has('_rsc');

    // Helper to try fetching multiple asset paths
    const tryAssets = async (paths) => {
      for (const path of paths) {
        try {
          // IMPORTANT: Strip query parameters when fetching from static assets
          // Static assets in Cloudflare are stored by their clean file path
          const assetUrl = new URL(path, url.origin);
          const assetRequest = new Request(assetUrl.toString(), {
            method: request.method,
            headers: request.headers,
          });

          const response = await env.ASSETS.fetch(assetRequest);
          if (response.status === 200) return response;
        } catch (e) {
          // Continue to next path
        }
      }
      return null;
    };

    // Handle special routes (robots, sitemap)
    if (url.pathname === '/robots.txt') {
      const robotsContent = `User-agent: *\nAllow: /\nCrawl-delay: 1\n\nSitemap: https://quizbase.xn--schchner-2za.de/sitemap.xml\nHost: https://quizbase.xn--schchner-2za.de`;
      return new Response(robotsContent, { headers: { 'Content-Type': 'text/plain' } });
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

    // Try direct asset fetch first (for static files like .js, .css, .png)
    // We strip the query string to find the exact file
    const cleanRequest = new Request(new URL(url.pathname, url.origin).toString(), request);
    const directAsset = await env.ASSETS.fetch(cleanRequest);
    if (directAsset.status === 200) {
      if (url.pathname.endsWith('.js')) {
        return new Response(directAsset.body, {
          status: 200,
          headers: { ...Object.fromEntries(directAsset.headers), 'Content-Type': 'application/javascript' }
        });
      }
      return directAsset;
    }

    // Routing Logic for Pages
    const cleanPath = url.pathname.replace(/\/$/, '') || '/';
    const parts = cleanPath.split('/').filter(Boolean);
    let potentialAssetPaths = [];
    let isDynamicRoute = false;

    if (cleanPath === '/') {
      potentialAssetPaths = isRSC ? ['/index.rsc', '/index.html'] : ['/index.html'];
    } else if (parts[0] === 'presenter') {
      if (parts[1] === 'edit' && parts.length >= 3) {
        // Dynamic route - serve SPA to let client-side routing handle it
        isDynamicRoute = true;
        potentialAssetPaths = ['/index.html'];
      } else if (parts.length >= 3 && parts[2] === 'stats') {
        // Dynamic route - serve SPA to let client-side routing handle it
        isDynamicRoute = true;
        potentialAssetPaths = ['/index.html'];
      } else if (parts.length >= 2) {
        // Dynamic route - serve SPA to let client-side routing handle it
        isDynamicRoute = true;
        potentialAssetPaths = ['/index.html'];
      }
    } else if (parts[0] === 'p' && parts.length >= 2) {
      // Dynamic route - serve SPA to let client-side routing handle it
      isDynamicRoute = true;
      potentialAssetPaths = ['/index.html'];
    } else if (parts[0] === 'profile' && parts.length >= 2) {
      // Dynamic route - serve SPA to let client-side routing handle it
      isDynamicRoute = true;
      potentialAssetPaths = ['/index.html'];
    } else {
      // Standard static pages
      potentialAssetPaths = isRSC
        ? [`${cleanPath}.rsc`, `${cleanPath}.html`, `${cleanPath}/page.html`]
        : [`${cleanPath}.html`, `${cleanPath}/page.html`];
    }

    const pageResponse = await tryAssets(potentialAssetPaths);
    if (pageResponse) {
      return pageResponse;
    }

    // SPA Fallback for any remaining routes
    const fallback = await tryAssets(['/index.html']);
    if (fallback) return fallback;

    return new Response('Not Found', { status: 404 });
  }
};
