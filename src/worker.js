/**
 * Cloudflare Worker for serving Next.js static assets and HTML files
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle static assets first (JS, CSS, images)
    if (path.startsWith('/_next/static/') || path.startsWith('/favicon.ico')) {
      try {
        const assetRequest = new Request(`https://example.com${path}`, request);
        const assetResponse = await env.ASSETS.fetch(assetRequest);
        
        if (assetResponse.status === 200) {
          return assetResponse;
        }
      } catch (error) {
        // Asset not found, continue to fallback
      }
    }

    // Handle HTML pages
    let htmlPath = path;
    if (path === '/') {
      htmlPath = '/index.html';
    } else if (!path.endsWith('.html') && !path.includes('.')) {
      htmlPath = `${path}.html`;
    }

    try {
      const htmlRequest = new Request(`https://example.com${htmlPath}`, request);
      const htmlResponse = await env.ASSETS.fetch(htmlRequest);
      
      if (htmlResponse.status === 200) {
        return htmlResponse;
      }
    } catch (error) {
      // HTML file not found, continue to fallback
    }

    // For client-side routing, serve index.html for any unmatched routes
    try {
      const indexResponse = await env.ASSETS.fetch(new Request('https://example.com/index.html'));
      if (indexResponse.status === 200) {
        return indexResponse;
      }
    } catch (error) {
      // Index not found either
    }

    // Return 404 if nothing matches
    return new Response('Not Found', { status: 404 });
  }
};
