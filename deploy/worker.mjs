import { handleChat, cleanupExpired } from '../server/chat.mjs';
export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  let response;
  if (url.pathname.startsWith('/api/chat/')) {
   // External Workers have no trusted Sites identity gateway. Use room tokens.
   const headers = new Headers(request.headers);
   headers.delete('oai-authenticated-user-id');
   response = await handleChat(new Request(request, { headers }), env.DB);
  } else if (url.pathname === '/') {
   response = Response.redirect(new URL('/play/index.html', url), 302);
  } else {
   response = await env.ASSETS.fetch(request);
  }
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(self)');
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('/sw.js')) headers.set('Cache-Control', 'no-cache');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
 },
 async scheduled(event, env, ctx) { ctx.waitUntil(cleanupExpired(env.DB)); }
};
