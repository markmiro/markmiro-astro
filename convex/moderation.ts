import { v, type Infer } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { commentStatus, moderationScores } from "./schema";

type Scores = Infer<typeof moderationScores>;
type Verdict = Exclude<Infer<typeof commentStatus>, "pending">;

// Each question returns a probability from 0 to 1.
const QUESTIONS = {
  spam: "Is this comment spam, an ad, SEO link-dropping, or self-promotion unrelated to the discussion?",
  abusive:
    "Does this comment insult, harass, threaten, or demean a person or group? Harsh but civil criticism of ideas does not count.",
  privateInfo:
    "Does this comment expose someone's private personal information (address, phone, email, private details)?",
  onTopic:
    "Is this comment a genuine response to the blog post or to the parent comment?",
  negative:
    "Is this comment sarcastic, dismissive, mocking, or negative in tone toward the post or its author?",
} satisfies Record<keyof Scores, string>;

/**
 * Thresholds were picked by running sample comments through Jev. Sarcasm
 * scores about 0.6 abusive and 0.97 negative, so it lands in "collapsed".
 */
export function decide(s: Scores): Verdict {
  if (s.spam >= 0.9 || s.privateInfo >= 0.9 || s.abusive >= 0.9) {
    return "rejected";
  }
  if (s.spam >= 0.5 || s.privateInfo >= 0.5 || s.onTopic < 0.3) return "held";
  if (s.abusive >= 0.5 || s.negative >= 0.5) return "collapsed";
  return "approved";
}

async function scoreWithJev(postTitle: string, body: string): Promise<Scores> {
  const apiKey = process.env.JEV_API_KEY;
  if (!apiKey) throw new Error("JEV_API_KEY is not set");

  const questions = Object.fromEntries(
    Object.entries(QUESTIONS).map(([name, instructions]) => [
      name,
      { type: "noul", instructions },
    ]),
  );

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("https://api.typesafe.ai/v1/systemone", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "jev-latest",
          state: { post: { title: postTitle }, comment: body },
          questions,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        throw new Error(`Jev ${res.status}: ${(await res.text()).slice(0, 200)}`);
      }
      const { answers } = await res.json();
      const scores = Object.fromEntries(
        Object.keys(QUESTIONS).map((name) => {
          const p = answers?.[name]?.noul;
          if (typeof p !== "number") throw new Error(`Jev gave no "${name}"`);
          return [name, p];
        }),
      );
      return scores as Scores;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export const moderate = internalAction({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const comment = await ctx.runQuery(internal.moderation.getPending, {
      commentId,
    });
    if (!comment) return;

    try {
      const scores = await scoreWithJev(comment.postTitle, comment.body);
      await ctx.runMutation(internal.moderation.setResult, {
        commentId,
        status: decide(scores),
        scores,
      });
    } catch (error) {
      // Fail closed: if Jev is down, hold the comment for review.
      await ctx.runMutation(internal.moderation.setResult, {
        commentId,
        status: "held",
        moderationError: String(error),
      });
    }
  },
});

export const getPending = internalQuery({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const comment = await ctx.db.get(commentId);
    return comment?.status === "pending" ? comment : null;
  },
});

export const setResult = internalMutation({
  args: {
    commentId: v.id("comments"),
    status: commentStatus,
    scores: v.optional(moderationScores),
    moderationError: v.optional(v.string()),
  },
  handler: async (ctx, { commentId, ...result }) => {
    await ctx.db.patch(commentId, result);
  },
});

/**
 * Try the thresholds without saving anything:
 * npx convex run moderation:check '{"body": "Great post!"}'
 */
export const check = internalAction({
  args: { body: v.string(), postTitle: v.optional(v.string()) },
  handler: async (_ctx, { body, postTitle = "Too much Tailwind?" }) => {
    const scores = await scoreWithJev(postTitle, body);
    return { verdict: decide(scores), scores };
  },
});
