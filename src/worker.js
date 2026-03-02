/**
 * Cloudflare Worker for serving Next.js static assets and HTML files
 */

function getMimeType(path) {
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.ico')) return 'image/x-icon';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  return 'text/plain';
}

function addCorsHeaders(response) {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return newResponse;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Handle static assets first (JS, CSS, images)
    if (path.startsWith('/_next/static/') || path.startsWith('/_next/')) {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        
        if (assetResponse.status === 200) {
          const response = addCorsHeaders(assetResponse);
          // Ensure correct MIME type
          const mimeType = getMimeType(path);
          if (mimeType && !response.headers.get('Content-Type')) {
            response.headers.set('Content-Type', mimeType);
          }
          return response;
        }
      } catch (error) {
        console.error('Asset fetch error:', error);
      }
    }

    // Handle favicon
    if (path === '/favicon.ico') {
      try {
        const faviconResponse = await env.ASSETS.fetch(request);
        if (faviconResponse.status === 200) {
          return addCorsHeaders(faviconResponse);
        }
      } catch (error) {
        // Favicon not found
      }
    }

    // Handle HTML pages - check for exact HTML file first
    try {
      const htmlResponse = await env.ASSETS.fetch(request);
      
      if (htmlResponse.status === 200) {
        return addCorsHeaders(htmlResponse);
      }
    } catch (error) {
      // HTML file not found, continue to fallback
    }

    // Handle HTML pages with .html extension
    if (!path.endsWith('.html') && !path.includes('.')) {
      try {
        const htmlPath = `${path}.html`;
        const htmlRequest = new Request(new URL(htmlPath, url), request);
        const htmlResponse = await env.ASSETS.fetch(htmlRequest);
        
        if (htmlResponse.status === 200) {
          return addCorsHeaders(htmlResponse);
        }
      } catch (error) {
        // HTML file not found, continue to fallback
      }
    }

    // Handle root path
    if (path === '/') {
      try {
        const indexRequest = new Request(new URL('/index.html', url), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);
        if (indexResponse.status === 200) {
          return addCorsHeaders(indexResponse);
        }
      } catch (error) {
        // Index not found
      }
    }

    // For client-side routing, serve index.html for any unmatched routes
    try {
      const indexRequest = new Request(new URL('/index.html', url), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      if (indexResponse.status === 200) {
        return addCorsHeaders(indexResponse);
      }
    } catch (error) {
      // Index not found either
    }

    // Return 404 if nothing matches
    return new Response('Not Found', { 
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    });
  }
};
