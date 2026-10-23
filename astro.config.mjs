import { execFileSync } from "node:child_process";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import { worktreePorts } from "./scripts/worktree-ports.mjs";

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

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), icon(), tailscaleUrl],
  // Fail loudly instead of shifting to another port, so the printed URL is real.
  server: { port: PORT, strictPort: true },
  vite: {
    plugins: [tailwindcss()],
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
