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

In dev, S3 images and videos load from the local bucket copy in `../s3` (see [S3 Files](#s3-files)), so new files show up before they're uploaded. Files missing locally load from the bucket. `dev`, `s3-down`, and `s3-up` use the `markmiro-s3` profile and prompt you to sign in when the AWS session has expired.

### Ports per worktree

Each git worktree gets a **slot** so several checkouts can run `pnpm dev` at once: the main checkout is slot 0 and keeps the base port, and every other worktree adds its slot to it. Slots are handed out on first use and remembered in `.git/markmiro-astro-worktree-slots.json`, which every worktree shares ([`scripts/worktree-ports.mjs`](scripts/worktree-ports.mjs)); entries for deleted worktrees are pruned. `pnpm ports` prints the plan for the current worktree.

| Worktree        | Port     |
| --------------- | -------- |
| Main checkout   | 8791     |
| Worktree slot N | 8791 + N |

`PORT=1234 pnpm dev` overrides it. The server fails instead of picking another port if it's taken, so the printed URL is always the real one.

## Colors

Colors come from [huet](https://github.com/markmiro/huet), installed from its prebuilt `dist` branch (`github:markmiro/huet#dist`). The lockfiles pin a commit; `bun update huet` and `pnpm update huet` pull the latest build.

Instead of Tailwind's palette, use contrast steps against the page background: `text-c60`, `border-c12`, `bg-c4`. They work in light and dark mode, so there's no need for `dark:` variants. Signal colors are `text-red`, `bg-blue-fill text-on-blue`, `bg-yellow-soft`, and so on. See [`src/lib/palette.ts`](src/lib/palette.ts).

Each of huet's theme presets is computed in both modes at build time into `/huet.css`. The theme picker in the nav switches presets. The default, Base, matches the colors images are assumed to be in. Every other preset also recolors images in the browser, halfway toward the preset, with huet's image recoloring (`huet/images`, [`src/lib/recolorImages.ts`](src/lib/recolorImages.ts)). Hovering an image shows the original. The picker can also open huet-react's theme configurator ([`src/components/ThemeConfigurator.tsx`](src/components/ThemeConfigurator.tsx)), loaded only when opened; an edited theme becomes the picker's Custom theme, saved in localStorage ([`src/lib/customTheme.ts`](src/lib/customTheme.ts)). On page load, images wait hidden until their recolored version is ready, so the original colors don't flash. The browser can only read pixels from the site's own origin, so images from the S3 bucket and other hosts without CORS are fetched through same-origin proxies: rewrites in [`vercel.json`](vercel.json) and a dev middleware in `astro.config.mjs`, both listed in [`src/lib/imageProxies.ts`](src/lib/imageProxies.ts). Images on other hosts aren't recolored.

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

## Views, likes, comments, and subscriptions

These run on [Convex](https://dashboard.convex.dev/t/mark-miro/markmiro-site). The pages stay static; React islands at the bottom of each post talk to Convex from the browser.

- **Views**: each post sends one beacon per browser per day to Convex's `/view` endpoint. Headless browsers (including the Playwright tests) are skipped.
- **Your own visits**: open `/me` once in each of your browsers. Those browsers aren't counted as views, and Vercel Analytics skips them.
- **Likes**: one per browser, remembered with a random ID in localStorage.
- **Comments**: sign-in is through [Clerk](https://dashboard.clerk.com). New comments are scored by [Jev](https://typesafe.ai) and then approved, published behind "Show comment" (sarcastic or negative), held for review, or rejected. The thresholds are in `convex/moderation.ts`. Try them with `npx convex run moderation:check '{"body": "…"}'`. To change a comment's status, edit it in the Convex dashboard.
- **Daily digest**: a cron in `convex/crons.ts` emails the last day's comments to `DIGEST_TO` at 15:00 UTC. Days without comments send nothing.
- **Subscribe**: the form posts straight to Convex, so it works without JavaScript. Subscribers confirm by email. After publishing a post, email it to them with `npx convex run --prod subscribers:sendPost '{"slug": "…", "title": "…"}'`.

### Local setup

```sh
npx convex dev # Pushes functions on save and writes .env.local
```

The site reads `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`, and `PUBLIC_CLERK_PUBLISHABLE_KEY`; see [.env.example](.env.example).

Convex functions read their own environment variables, set with `npx convex env set` (add `--prod` for production):

| Variable | Value |
| --- | --- |
| `JEV_API_KEY` | TypeSafe API key |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk Frontend API URL, e.g. `https://fluent-rattler-9105.clerk.accounts.dev` |
| `SITE_URL` | Your dev server URL for dev (see `pnpm ports`), `https://www.markmiro.com` for prod |
| `DIGEST_TO` | Where the daily comment digest goes |
| `RESEND_API_KEY` | Resend API key. Until it's set, emails are skipped with a warning |
| `EMAIL_FROM` | `Mark Miro <posts@updates.markmiro.com>` (`updates.markmiro.com` is the domain verified in Resend) |

### Production

`bun run deploy` runs `npx convex deploy` before building. Production builds read `.env.production`, which takes precedence over `.env.local`; put the production Convex URLs and Clerk key there.

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
