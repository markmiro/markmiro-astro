// https://github.com/withastro/prettier-plugin-astro/blob/main/README.md#pnpm-support-1
// Adding this so VSCode can detect the plugin
module.exports = {
  plugins: [require.resolve("prettier-plugin-astro")],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
