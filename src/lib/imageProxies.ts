import { bucketUrl } from "./bucket";

/*
  Image hosts that don't send CORS headers, proxied through the site's origin
  so huet can read their pixels to recolor them. Served by vercel.json's
  rewrites in production and by astro.config.mjs in dev; keep all three in sync.
*/
export const imageProxies: Record<string, string> = {
  "/proxy/s3": bucketUrl,
  "/proxy/vscodethemes": "https://vscodethemes.com",
};

/** Where images keep their original colors: PhotoSwipe's lightbox (Gallery.tsx). */
export const unrecolored = ".pswp";

/** CSS for the images recolorImages can read: same-origin and proxied ones. */
export const readableImages = `:is(${[
  'img[src^="/"]:not([src^="//"])',
  ...Object.values(imageProxies).map((origin) => `img[src^="${origin}/"]`),
].join(", ")}):not(${unrecolored} img)`;
