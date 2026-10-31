import { recolorImage, type Palette } from "huet/images";
import { imageProxies, unrecolored } from "./imageProxies";

/*
  Recolors the page's images into a huet preset, client side. huet reads each
  pixel as coordinates on its default ramps and puts them on the preset's
  ramps, which bakes into one 3D LUT per preset. The GPU (or the CPU without
  WebGL2) applies it to each image, and the result replaces the image's src
  until the preset changes. Hovering an image shows the original.

  huet/images also has mountImages, which does this with a canvas next to
  each image. It can't read images from hosts without CORS, though, and
  galleries here expect real <img>s, so the src swap stays.

  Scripts can only read same-origin pixels (or ones served with CORS), so
  images from other hosts are read through the site's proxies
  (imageProxies.ts).

  When a page loads with a preset already picked, Head.astro marks <html> with
  `data-recolor-pending`, and /huet.css hides readable images until they get
  `data-recolored`, so the originals never flash. Switching presets on a page
  shows the originals until their recolored versions are ready.
*/

/** A same-origin URL for an image's pixels, if there's a way to read them. */
function readableUrl(src: string) {
  const url = new URL(src, location.href);
  if (url.origin === location.origin) return url.href;
  const proxy = Object.entries(imageProxies).find(([, origin]) => origin === url.origin);
  return proxy && proxy[0] + url.pathname + url.search;
}

const LUT_SIZE = 33;
// Halfway to the preset, with saturated colors keeping their own hue.
const OPTIONS = { lutSize: LUT_SIZE, strength: 0.5, tint: 0 };
// Longest side of a recolored image, in device pixels.
const MAX_SIZE = 2400;

interface Original {
  src: string;
  srcset: string | null;
  /** The original, loaded with CORS so the GPU can read it. */
  pixels?: Promise<HTMLImageElement>;
  /** Blob URL of the current recolored version. */
  recolored?: string;
  hovered?: boolean;
}

const originals = new Map<HTMLImageElement, Original>();
let palette: Palette | null = null;
// Bumped on every preset change so slow images don't apply a stale preset.
let version = 0;

const visible = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      visible.unobserve(entry.target);
      void recolor(entry.target as HTMLImageElement, version);
    }
  },
  // Well ahead of scrolling, since images wait hidden on first load.
  { rootMargin: "1000px 0px" },
);

// Images added later, e.g. by React components.
new MutationObserver((records) => {
  if (!palette) return;
  for (const record of records)
    for (const node of record.addedNodes)
      if (node instanceof Element)
        for (const img of imagesIn(node)) visible.observe(img);
}).observe(document.body, { childList: true, subtree: true });

function imagesIn(root: Element) {
  const images = root.matches("img") ? [root] : root.querySelectorAll("img");
  return ([...images] as HTMLImageElement[]).filter(
    (img) => readableUrl(img.src) && !img.closest(unrecolored),
  );
}

async function loadPixels(src: string) {
  const image = new Image();
  image.src = readableUrl(src)!;
  await image.decode();
  return image;
}

async function recolor(img: HTMLImageElement, at: number) {
  if (!img.complete) {
    await new Promise((done) => {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  }
  let original = originals.get(img);
  if (!original) {
    original = { src: img.currentSrc || img.src, srcset: img.getAttribute("srcset") };
    originals.set(img, original);
    // For code that wants the original, like the lightbox's placeholder.
    img.dataset.originalSrc = original.src;
    showOriginalOnHover(img, original);
  }
  original.pixels ??= loadPixels(original.src);
  let source: HTMLImageElement;
  try {
    source = await original.pixels;
  } catch {
    // Not readable; keep the original.
    img.dataset.recolored = "original";
    return;
  }
  if (at !== version || !palette) return;

  const { naturalWidth: width, naturalHeight: height } = source;
  const scale = Math.min(1, MAX_SIZE / Math.max(width, height));
  const scaled =
    scale < 1
      ? await createImageBitmap(source, {
          resizeWidth: Math.round(width * scale),
          resizeHeight: Math.round(height * scale),
          resizeQuality: "high",
        })
      : source;
  if (at !== version || !palette) return;
  const canvas = recolorImage(scaled, palette, OPTIONS);
  if (scaled instanceof ImageBitmap) scaled.close();
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done));
  if (!blob || at !== version) return;

  // Decoded off to the side first, so the <img> paints it the moment its src
  // changes. The src and `data-recolored` change together, since the hiding
  // rule in /huet.css stops matching a blob src and the fade-in starts on the
  // attribute; apart, the image shows at full opacity for a frame.
  const url = URL.createObjectURL(blob);
  const decoded = new Image();
  decoded.src = url;
  await decoded.decode().catch(() => {});
  if (at !== version) return URL.revokeObjectURL(url);

  const previous = original.recolored;
  original.recolored = url;
  img.removeAttribute("srcset");
  if (!original.hovered) img.src = url;
  img.dataset.recolored = "true";
  if (previous) URL.revokeObjectURL(previous);
}

function showOriginalOnHover(img: HTMLImageElement, original: Original) {
  // The browser already has the original, so the swap is immediate.
  img.addEventListener("pointerenter", () => {
    original.hovered = true;
    if (original.recolored) img.src = original.src;
  });
  img.addEventListener("pointerleave", () => {
    original.hovered = false;
    if (original.recolored) img.src = original.recolored;
  });
}

function restore(img: HTMLImageElement, original: Original) {
  if (original.srcset !== null) img.setAttribute("srcset", original.srcset);
  img.src = original.src;
  if (original.recolored) URL.revokeObjectURL(original.recolored);
  original.recolored = undefined;
}

/** Recolor every image into `palette`, or put the originals back if it's null. */
export function recolorImages(next: Palette | null) {
  version++;
  visible.disconnect();
  palette = next;
  if (!palette) {
    // Nothing left to wait for, so show any image still hidden.
    document.documentElement.removeAttribute("data-recolor-pending");
    for (const [img, original] of originals) restore(img, original);
    return;
  }
  for (const img of imagesIn(document.body)) visible.observe(img);
}
