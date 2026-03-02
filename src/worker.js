/**
 * Cloudflare Worker for serving Next.js static assets and HTML files
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle static assets first (JS, CSS, images)
    if (path.startsWith('/_next/static/')) {
      try {
        // Remove the _next prefix and map to static directory
        const assetPath = path.replace('/_next', '');
        const assetRequest = new Request(assetPath, request);
        const assetResponse = await env.ASSETS.fetch(assetRequest);
        
        if (assetResponse.status === 200) {
          return assetResponse;
        }
      } catch (error) {
        // Asset not found, continue to fallback
      }
    }

    // Handle favicon
    if (path === '/favicon.ico') {
      try {
        const faviconResponse = await env.ASSETS.fetch(new Request('/favicon.ico', request));
        if (faviconResponse.status === 200) {
          return faviconResponse;
        }
      } catch (error) {
        // Favicon not found
      }
    }

    // Handle HTML pages - check for exact HTML file first
    try {
      const htmlRequest = new Request(path, request);
      const htmlResponse = await env.ASSETS.fetch(htmlRequest);
      
      if (htmlResponse.status === 200) {
        return htmlResponse;
      }
    } catch (error) {
      // HTML file not found, continue to fallback
    }

    // Handle HTML pages with .html extension
    if (!path.endsWith('.html') && !path.includes('.')) {
      try {
        const htmlPath = `${path}.html`;
        const htmlRequest = new Request(htmlPath, request);
        const htmlResponse = await env.ASSETS.fetch(htmlRequest);
        
        if (htmlResponse.status === 200) {
          return htmlResponse;
        }
      } catch (error) {
        // HTML file not found, continue to fallback
      }
    }

    // Handle root path
    if (path === '/') {
      try {
        const indexResponse = await env.ASSETS.fetch(new Request('/index.html'));
        if (indexResponse.status === 200) {
          return indexResponse;
        }
      } catch (error) {
        // Index not found
      }
    }

    // For client-side routing, serve index.html for any unmatched routes
    try {
      const indexResponse = await env.ASSETS.fetch(new Request('/index.html'));
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
