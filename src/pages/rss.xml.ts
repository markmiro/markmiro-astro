import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { compareFrontmatterDateDesc, parseFrontmatterDateRange } from "@/lib/misc";

export async function GET(context: APIContext) {
  const posts = await getCollection("posts", ({ data }) => data.draft !== true);

  return rss({
    title: "Mark Miro",
    description: "Posts by Mark Miro",
    site: context.site!,
    trailingSlash: false,
    items: posts.sort(compareFrontmatterDateDesc).map((post) => ({
      title: post.data.title,
      description: post.data.description ?? undefined,
      pubDate: parseFrontmatterDateRange(post.data.date)[0],
      link: `/posts/${post.id}`,
    })),
  });
}
