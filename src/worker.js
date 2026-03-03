/**
 * Cloudflare Worker for serving Next.js static assets and HTML files
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.ASSETS) {
      return new Response('Service unavailable', { status: 503 });
    }

    // Try to serve the requested asset directly
    try {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    } catch {
      // Asset fetch failed; fall through to SPA fallback below
    }

    // SPA fallback: serve index.html for client-side routing (dynamic routes)
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
