import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { assertSlug } from "./validate";

const MAX_LENGTH = 2000;
const MAX_PER_HOUR = 5;

/**
 * Published comments for a post, plus the viewer's own comments that aren't
 * published (so they can see "Checking…" or "Awaiting review").
 */
export const list = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const identity = await ctx.auth.getUserIdentity();
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .collect();

    return comments
      .filter(
        (c) =>
          c.status === "approved" ||
          c.status === "collapsed" ||
          c.authorId === identity?.subject,
      )
      .map((c) => ({
        _id: c._id,
        _creationTime: c._creationTime,
        authorName: c.authorName,
        authorImage: c.authorImage,
        body: c.body,
        status: c.status,
        isOwn: c.authorId === identity?.subject,
      }));
  },
});

export const add = mutation({
  args: { slug: v.string(), postTitle: v.string(), body: v.string() },
  handler: async (ctx, { slug, postTitle, body }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Sign in to comment.");
    assertSlug(slug);

    body = body.trim();
    if (!body) throw new ConvexError("Comment is empty.");
    if (body.length > MAX_LENGTH) {
      throw new ConvexError(`Comments are limited to ${MAX_LENGTH} characters.`);
    }

    const hourAgo = Date.now() - 60 * 60 * 1000;
    const recent = await ctx.db
      .query("comments")
      .withIndex("by_author", (q) =>
        q.eq("authorId", identity.subject).gt("_creationTime", hourAgo),
      )
      .take(MAX_PER_HOUR);
    if (recent.length >= MAX_PER_HOUR) {
      throw new ConvexError("You're commenting a lot. Try again in an hour.");
    }

    const commentId = await ctx.db.insert("comments", {
      slug,
      postTitle: postTitle.slice(0, 200),
      authorId: identity.subject,
      authorName: identity.name ?? identity.nickname ?? "Anonymous",
      authorImage: identity.pictureUrl,
      body,
      status: "pending",
    });
    await ctx.scheduler.runAfter(0, internal.moderation.moderate, {
      commentId,
    });
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const comment = await ctx.db.get(commentId);
    if (!identity || comment?.authorId !== identity.subject) {
      throw new ConvexError("You can only delete your own comments.");
    }
    await ctx.db.delete(commentId);
  },
});
