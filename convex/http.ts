import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { siteUrl } from "./email";

const http = httpRouter();

function redirectToSubscribePage(status: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: `${siteUrl()}/subscribe?status=${status}` },
  });
}

// Posts send `navigator.sendBeacon(url, JSON.stringify({ slug }))`. A text body
// keeps it a "simple" request, so the browser skips the CORS preflight.
http.route({
  path: "/view",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const headers = { "Access-Control-Allow-Origin": "*" };
    try {
      const { slug } = JSON.parse(await request.text());
      await ctx.runMutation(internal.stats.recordView, { slug: String(slug) });
      return new Response(null, { status: 204, headers });
    } catch {
      return new Response(null, { status: 400, headers });
    }
  }),
});

// A plain HTML form posts here, so subscribing works without JavaScript.
http.route({
  path: "/subscribe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const form = await request.formData();
    // Honeypot field that's hidden from people. Bots fill it in.
    if (form.get("website")) return redirectToSubscribePage("check-email");
    const valid = await ctx.runMutation(internal.subscribers.subscribe, {
      email: String(form.get("email") ?? ""),
    });
    return redirectToSubscribePage(valid ? "check-email" : "invalid");
  }),
});

http.route({
  path: "/confirm",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const ok = await ctx.runMutation(internal.subscribers.confirm, { token });
    return redirectToSubscribePage(ok ? "confirmed" : "invalid-link");
  }),
});

// Email link scanners follow GET links, so GET only shows a button and the
// POST does the work. Mail apps' one-click unsubscribe (RFC 8058) also POSTs.
http.route({
  path: "/unsubscribe",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const action = `?token=${encodeURIComponent(token)}`;
    return new Response(
      `<!doctype html><meta name="viewport" content="width=device-width">
<title>Unsubscribe</title>
<body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem">
<h1>Unsubscribe from Mark Miro's posts?</h1>
<form method="post" action="${action}"><button style="font-size:1rem;padding:.5rem 1rem">Unsubscribe</button></form>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }),
});

http.route({
  path: "/unsubscribe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const ok = await ctx.runMutation(internal.subscribers.unsubscribe, { token });
    return redirectToSubscribePage(ok ? "unsubscribed" : "invalid-link");
  }),
});

export default http;
