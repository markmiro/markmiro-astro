import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.mdx", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    // EX: "Mar 13, 2023"
    date: z.string(),
    draft: z.boolean().default(false),
    emoji: z.string().nullish(),
    image: z.string().optional(),
  }),
});

const projects = defineCollection({
  // Files starting with "_" (like `_example.mdx`) are templates, not projects.
  loader: glob({ pattern: "**/[^_]*.mdx", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    // A date range. EX: "Dec 4, 2018-Mar 21, 2019" or "Apr 20-May 18, 2023"
    date: z.string(),
    draft: z.boolean().default(false),
    emoji: z.string().nullish(),
    image: z.string().optional(),
    primaryLink: z.string().optional(),
    primaryLinkText: z.string().optional(),
    source: z.string().optional(),
  }),
});

export const collections = { posts, projects };
