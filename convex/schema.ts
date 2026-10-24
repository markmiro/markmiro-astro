import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const commentStatus = v.union(
  // Waiting for Jev.
  v.literal("pending"),
  v.literal("approved"),
  // Published, but folded behind "Show comment" (sarcastic or negative).
  v.literal("collapsed"),
  // Not published until Mark reviews it.
  v.literal("held"),
  v.literal("rejected"),
);

export const moderationScores = v.object({
  spam: v.number(),
  abusive: v.number(),
  privateInfo: v.number(),
  onTopic: v.number(),
  negative: v.number(),
});

export default defineSchema({
  // One row per post slug.
  postStats: defineTable({
    slug: v.string(),
    views: v.number(),
    likes: v.number(),
  }).index("by_slug", ["slug"]),

  // One row per browser that liked a post. `visitorId` is a random ID kept in
  // localStorage, so likes are per browser, not per person.
  likes: defineTable({
    slug: v.string(),
    visitorId: v.string(),
  }).index("by_slug_visitor", ["slug", "visitorId"]),

  comments: defineTable({
    slug: v.string(),
    postTitle: v.string(),
    // Clerk user ID (`identity.subject`).
    authorId: v.string(),
    authorName: v.string(),
    authorImage: v.optional(v.string()),
    body: v.string(),
    status: commentStatus,
    scores: v.optional(moderationScores),
    // Set when Jev couldn't be reached and the comment was held instead.
    moderationError: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"]),

  subscribers: defineTable({
    email: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("unsubscribed"),
    ),
    // Secret used in confirm and unsubscribe links.
    token: v.string(),
    confirmationSentAt: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_status", ["status"]),
});
