import type { APIRoute } from "astro";
import { readableImages } from "@/lib/imageProxies";
import { presetsCss } from "@/lib/palette";

// Hides images that are about to be recolored on page load, so their
// original colors don't flash, then fades each in once it's ready. An
// animation rather than a transition, so images keep their own transitions.
// The fade matches on the attribute alone: once recolored, an image's src is
// a blob URL, and hovering swaps the original back in. See recolorImages.ts.
const pendingImages = `html[data-recolor-pending] :is(${readableImages}):not([data-recolored]) {
  visibility: hidden;
}

@media (prefers-reduced-motion: no-preference) {
  html[data-recolor-pending] img[data-recolored] {
    animation: huet-fade-in 400ms ease-out;
  }
}

@keyframes huet-fade-in {
  from {
    opacity: 0;
  }
}`;

// Every huet preset's colors, in light and dark mode. Linked from Head.astro.
export const GET: APIRoute = () =>
  new Response(`${presetsCss()}\n\n${pendingImages}\n`, {
    headers: { "Content-Type": "text/css" },
  });
