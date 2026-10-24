import { v } from "convex/values";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { assertSlug, assertVisitorId } from "./validate";

async function getOrCreateStats(ctx: MutationCtx, slug: string) {
  const stats = await ctx.db
    .query("postStats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (stats) return stats;
  const id = await ctx.db.insert("postStats", { slug, views: 0, likes: 0 });
  return (await ctx.db.get(id))!;
}

export const get = query({
  args: { slug: v.string(), visitorId: v.optional(v.string()) },
  handler: async (ctx, { slug, visitorId }) => {
    const stats = await ctx.db
      .query("postStats")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    const like = visitorId
      ? await ctx.db
          .query("likes")
          .withIndex("by_slug_visitor", (q) =>
            q.eq("slug", slug).eq("visitorId", visitorId),
          )
          .unique()
      : null;
    return {
      views: stats?.views ?? 0,
      likes: stats?.likes ?? 0,
      liked: like !== null,
    };
  },
});

export const toggleLike = mutation({
  args: { slug: v.string(), visitorId: v.string() },
  handler: async (ctx, { slug, visitorId }) => {
    assertSlug(slug);
    assertVisitorId(visitorId);
    const stats = await getOrCreateStats(ctx, slug);
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_slug_visitor", (q) =>
        q.eq("slug", slug).eq("visitorId", visitorId),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(stats._id, { likes: Math.max(0, stats.likes - 1) });
    } else {
      await ctx.db.insert("likes", { slug, visitorId });
      await ctx.db.patch(stats._id, { likes: stats.likes + 1 });
    }
  },
});

// Called from the /view HTTP endpoint.
export const recordView = internalMutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    assertSlug(slug);
    const stats = await getOrCreateStats(ctx, slug);
    await ctx.db.patch(stats._id, { views: stats.views + 1 });
  },
});
