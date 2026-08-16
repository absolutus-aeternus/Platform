// Pages Function: Proxy /api/* requests to the Cloudflare Worker
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const workerUrl = "https://alliancehub-api.absolutus-aeternus.workers.dev" + url.pathname + url.search;
  
  const response = await fetch(workerUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.method !== "GET" && context.request.method !== "HEAD" ? context.request.body : undefined,
  });
  
  return response;
}
