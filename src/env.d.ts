/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_URL: string;
  readonly PUBLIC_CONVEX_SITE_URL: string;
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY: string;
}

interface Window {
  // Read by Vercel Analytics before sending each event.
  webAnalyticsBeforeSend?: <T>(event: T) => T | null;
}
