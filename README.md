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

## S3 Files

You'll need to be logged into the AWS account to download the files. Make sure you have the AWS CLI installed and configured.

The ENV vars can be found in the Vercel project settings.

Unless the S3 files are being updated, it's no necessary to download them locally.

Locally, the files should be one level above this root directory. I tried to get Vercel to ignore the files when placed in the repo directory, but Vercel would still try to upload them.

To download, run:

```sh
bun run s3-down
```

To upload, run:

```sh
bun run s3-up
```

## Deploying

```sh
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
