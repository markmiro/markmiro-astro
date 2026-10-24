import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { escapeHtml, sendEmail, sendEmails, siteUrl } from "./email";
import { isEmail } from "./validate";

// Don't resend a confirmation email to the same address more often than this,
// so the form can't be used to flood someone's inbox.
const RESEND_AFTER_MS = 10 * 60 * 1000;

function unsubscribeUrl(token: string) {
  return `${process.env.CONVEX_SITE_URL}/unsubscribe?token=${token}`;
}

/** Returns whether the address was valid. */
export const subscribe = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!isEmail(email)) return false;

    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing?.status === "confirmed") return true;

    let token = existing?.token;
    if (existing) {
      if (Date.now() - (existing.confirmationSentAt ?? 0) < RESEND_AFTER_MS) {
        return true;
      }
      await ctx.db.patch(existing._id, {
        status: "pending",
        confirmationSentAt: Date.now(),
      });
    } else {
      token = crypto.randomUUID();
      await ctx.db.insert("subscribers", {
        email,
        status: "pending",
        token,
        confirmationSentAt: Date.now(),
      });
    }
    await ctx.scheduler.runAfter(0, internal.subscribers.sendConfirmation, {
      email,
      token: token!,
    });
    return true;
  },
});

export const confirm = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const subscriber = await ctx.db
      .query("subscribers")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!subscriber) return false;
    if (subscriber.status !== "confirmed") {
      await ctx.db.patch(subscriber._id, {
        status: "confirmed",
        confirmedAt: Date.now(),
      });
    }
    return true;
  },
});

export const unsubscribe = internalMutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const subscriber = await ctx.db
      .query("subscribers")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!subscriber) return false;
    await ctx.db.patch(subscriber._id, { status: "unsubscribed" });
    return true;
  },
});

export const sendConfirmation = internalAction({
  args: { email: v.string(), token: v.string() },
  handler: async (_ctx, { email, token }) => {
    const url = `${process.env.CONVEX_SITE_URL}/confirm?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Confirm your subscription to Mark Miro's posts",
      text: `Confirm your subscription: ${url}\n\nIf you didn't sign up, ignore this email.`,
      html: `<p><a href="${url}">Confirm your subscription</a> to new posts from Mark Miro.</p><p>If you didn't sign up, ignore this email.</p>`,
    });
  },
});

export const confirmed = internalQuery({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("subscribers")
      .withIndex("by_status", (q) => q.eq("status", "confirmed"))
      .collect(),
});

/**
 * Email a new post to every confirmed subscriber. Run it after deploying:
 * npx convex run --prod subscribers:sendPost '{"slug": "big-files", "title": "Big files are good"}'
 */
export const sendPost = internalAction({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { slug, title, description },
  ): Promise<{ subscribers: number; sent: boolean }> => {
    const subscribers: Doc<"subscribers">[] = await ctx.runQuery(internal.subscribers.confirmed, {});
    const url = `${siteUrl()}/posts/${slug}`;
    const sent = await sendEmails(
      subscribers.map(({ email, token }) => ({
        to: email,
        subject: title,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl(token)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        text: [title, description, `Read it: ${url}`, `Unsubscribe: ${unsubscribeUrl(token)}`]
          .filter(Boolean)
          .join("\n\n"),
        html: [
          `<h2><a href="${url}">${escapeHtml(title)}</a></h2>`,
          description ? `<p>${escapeHtml(description)}</p>` : "",
          `<p><a href="${url}">Read the post →</a></p>`,
          `<p style="color:#888;font-size:12px"><a href="${unsubscribeUrl(token)}">Unsubscribe</a></p>`,
        ].join(""),
      })),
    );
    return { subscribers: subscribers.length, sent };
  },
});
