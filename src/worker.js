/**
 * Cloudflare Worker for serving Next.js static assets and HTML files
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    console.log(`Request path: ${path}`);
    console.log(`Available bindings:`, Object.keys(env));

    // Test if ASSETS binding exists
    if (env.ASSETS) {
      console.log('ASSETS binding found');
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        console.log(`Asset response status: ${assetResponse.status}`);
        
        if (assetResponse.status === 200) {
          console.log('Asset found, returning response');
          return assetResponse;
        } else {
          console.log(`Asset not found, status: ${assetResponse.status}`);
          console.log(`Response headers:`, Object.fromEntries(assetResponse.headers.entries()));
        }
      } catch (error) {
        console.error('Asset fetch error:', error);
      }
    } else {
      console.log('ASSETS binding not found');
    }

    // Return 404 if nothing matches
    console.log(`Returning 404 for path: ${path}`);
    return new Response(`Not Found: ${path}`, { 
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    });
  }
};
