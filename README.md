# markmiro-astro

Original README.md from astro: [README_ASTRO.md](README_ASTRO.md).

To use with VSCode with prettier, follow [this guide](https://github.com/withastro/prettier-plugin-astro/blob/main/README.md#using-in-vs-code).

## Development

Install dependencies

```sh
bun install
```

Run the dev server:

```sh
bun run dev
```

The dev server listens on all interfaces and prints a `Tailscale: http://<host>:<port>` line on startup, so you can open it from other devices on your tailnet. The host is `TAILSCALE_HOST` if set, otherwise this machine's name from `tailscale status --json`, otherwise `mbp.tail0fff0.ts.net`. Any `*.tail0fff0.ts.net` host is allowed.

### Ports per worktree

Each git worktree gets a **slot** so several checkouts can run `pnpm dev` at once: the main checkout is slot 0 and keeps the base port, and every other worktree adds its slot to it. Slots are handed out on first use and remembered in `.git/markmiro-astro-worktree-slots.json`, which every worktree shares ([`scripts/worktree-ports.mjs`](scripts/worktree-ports.mjs)); entries for deleted worktrees are pruned. `pnpm ports` prints the plan for the current worktree.

| Worktree        | Port     |
| --------------- | -------- |
| Main checkout   | 8791     |
| Worktree slot N | 8791 + N |

`PORT=1234 pnpm dev` overrides it. The server fails instead of picking another port if it's taken, so the printed URL is always the real one.

## Testing

End-to-end tests use [Playwright](https://playwright.dev) and live in `tests/`. They start their own dev server on port 4322, so they won't conflict with `bun run dev`.

Install the browser once:

```sh
bunx playwright install chromium
```

Run the tests:

```sh
bun run test
bun run test:ui # interactive mode
```

Pages that list S3 objects while rendering (like `/projects/jpeg-degrader`) are only checked when `AWS_PROFILE` or `AWS_ACCESS_KEY_ID` is set.

## S3 Files

Use the dedicated S3-only AWS profile. Follow [the local AWS S3 access guide](docs/aws-s3-access.md) to sign in and configure a new machine before running these commands.

Download the bucket before building or deploying. The jpeg-degrader page reads image sizes from the local copy at build time, and `bun run deploy` uploads the local copy first, so both fail without it.

Locally, the files should be one level above this root directory (`../s3`). I tried to get Vercel to ignore the files when placed in the repo directory, but Vercel would still try to upload them. The path is relative to the checkout, so each clone or worktree needs its own download.

To download, run:

```sh
export AWS_PROFILE=markmiro-s3
bun run s3-down
```

To upload, run:

```sh
bun run s3-up
```

## Deploying

Refresh the local bucket copy first. `deploy` uploads `../s3` before building, so a stale copy would overwrite newer files in the bucket.

```sh
export AWS_PROFILE=markmiro-s3
bun run s3-down
bun run deploy
```

## Troubleshooting

I disabled Vercel git integration because of env var issues.

For some reason, I've been getting ENV variable issues with AWS S3. The env vars are available for static builds locally, but it seems that Vercel doesn't inject them because it thinks the vars could be included into the client?

Deploy this way if build works locally but fails on Vercel:

```sh
vercel build
vercel deploy --prebuilt
```

Production build

```sh
vercel build --prod
vercel deploy --prebuilt --prod
```
