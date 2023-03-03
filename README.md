# markmiro-astro

Original README.md from astro: [README_ASTRO.md](README_ASTRO.md).

To use with VSCode with prettier, follow [this guide](https://github.com/withastro/prettier-plugin-astro/blob/main/README.md#using-in-vs-code).

I once had a Vercel build fail because it was missing the `shiki` dependency though it worked locally. I was able to repro by running `pnpm exec vercel run build` locally. I fixed it by adding `shiki` to the `devDependencies` in `package.json`.

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