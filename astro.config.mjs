import { execFileSync } from "node:child_process";
import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import { worktreePorts } from "./scripts/worktree-ports.mjs";
import { bucketUrl } from "./src/lib/s3.ts";
import { imageProxies } from "./src/lib/imageProxies.ts";

const FALLBACK_TAILSCALE_HOST = "mbp.tail0fff0.ts.net";
const TAILSCALE_CLIS = [
  "tailscale",
  "/Applications/Tailscale.app/Contents/MacOS/Tailscale",
];

// This machine's MagicDNS name: `TAILSCALE_HOST`, else whatever Tailscale
// reports for itself, else the fallback.
function tailscaleHost() {
  if (process.env.TAILSCALE_HOST) return process.env.TAILSCALE_HOST;
  for (const cli of TAILSCALE_CLIS) {
    try {
      const status = JSON.parse(
        execFileSync(cli, ["status", "--json"], {
          encoding: "utf8",
          timeout: 3000,
          stdio: ["ignore", "pipe", "ignore"],
        }),
      );
      const name = status?.Self?.DNSName?.replace(/\.$/, "");
      if (name) return name;
    } catch {
      // Not installed or not running: try the next one.
    }
  }
  return FALLBACK_TAILSCALE_HOST;
}

// `PORT` wins; otherwise the main checkout gets the base port and every other
// worktree adds its slot (see scripts/worktree-ports.mjs).
const PORT = Number(process.env.PORT) || worktreePorts().dev;
const TAILSCALE_HOST = tailscaleHost();

// Prints the Tailscale URL when the dev server starts.
const tailscaleUrl = {
  name: "tailscale-url",
  hooks: {
    "astro:server:start": ({ address }) => {
      console.log(`\nTailscale: http://${TAILSCALE_HOST}:${address.port}\n`);
    },
  },
};

const mirror = path.resolve("../s3");
const contentTypes = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
};

// In dev, `s3File` points at /s3/, served from the local bucket mirror
// (`bun run s3-down`) so new files show up before they're uploaded. Anything
// missing locally redirects to the bucket.
const localS3 = {
  name: "local-s3",
  configureServer(server) {
    server.middlewares.use("/s3", (req, res) => {
      const key = decodeURIComponent(new URL(req.url, "http://x").pathname).slice(1);
      const file = path.join(mirror, key);
      const isFile = file.startsWith(mirror + path.sep) && statSync(file, { throwIfNoEntry: false })?.isFile();
      if (!isFile) {
        res.writeHead(302, { Location: `${bucketUrl}/${key}` }).end();
        return;
      }
      res.setHeader("Content-Type", contentTypes[path.extname(file).toLowerCase()] ?? "application/octet-stream");
      createReadStream(file).pipe(res);
    });
  },
};

// In dev, stands in for vercel.json's image proxy rewrites.
const imageProxy = {
  name: "image-proxy",
  configureServer(server) {
    for (const [prefix, origin] of Object.entries(imageProxies)) {
      server.middlewares.use(prefix, async (req, res) => {
        const upstream = await fetch(origin + req.url);
        res.writeHead(upstream.status, {
          "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
        });
        res.end(Buffer.from(await upstream.arrayBuffer()));
      });
    }
  },
};

// https://astro.build/config
export default defineConfig({
  site: "https://www.markmiro.com",
  integrations: [react(), mdx(), icon(), tailscaleUrl],
  // Fail loudly instead of shifting to another port, so the printed URL is real.
  server: { port: PORT, strictPort: true },
  vite: {
    plugins: [tailwindcss(), localS3, imageProxy],
    server: {
      strictPort: true,
      allowedHosts: [
        TAILSCALE_HOST,
        FALLBACK_TAILSCALE_HOST,
        ".tail0fff0.ts.net",
      ],
    },
  },
});
