import { v } from "convex/values";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { escapeHtml, sendEmail, siteUrl } from "./email";

const DAY_MS = 24 * 60 * 60 * 1000;

// Most urgent first.
const SECTIONS = [
  { status: "held", title: "Held for your review" },
  { status: "pending", title: "Still pending (moderation didn't finish)" },
  { status: "collapsed", title: "Published behind “Show comment”" },
  { status: "approved", title: "Published" },
  { status: "rejected", title: "Rejected" },
] as const;

export const since = internalQuery({
  args: { since: v.number() },
  handler: (ctx, { since }) =>
    ctx.db
      .query("comments")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .collect(),
});

function dashboardUrl() {
  // EX: https://courteous-antelope-369.convex.cloud
  const deployment = new URL(process.env.CONVEX_CLOUD_URL!).hostname.split(".")[0];
  return `https://dashboard.convex.dev/d/${deployment}/data?table=comments`;
}

function renderComment(c: Doc<"comments">) {
  const scores = c.scores
    ? Object.entries(c.scores)
        .map(([name, value]) => `${name} ${value.toFixed(2)}`)
        .join(" · ")
    : `No scores${c.moderationError ? `: ${c.moderationError}` : ""}`;
  return `
    <div style="margin:0 0 16px;padding:12px;border:1px solid #ddd;border-radius:8px">
      <div style="font-size:13px;color:#666">
        <strong>${escapeHtml(c.authorName)}</strong> on
        <a href="${siteUrl()}/posts/${c.slug}">${escapeHtml(c.postTitle)}</a>
      </div>
      <p style="white-space:pre-wrap;margin:8px 0">${escapeHtml(c.body)}</p>
      <div style="font-size:12px;color:#888">${escapeHtml(scores)}</div>
    </div>`;
}

/** Runs daily from crons.ts. Sends nothing on days without comments. */
export const sendDaily = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: boolean; comments: number }> => {
    const to = process.env.DIGEST_TO;
    if (!to) throw new Error("DIGEST_TO is not set");

    const comments: Doc<"comments">[] = await ctx.runQuery(internal.digest.since, {
      since: Date.now() - DAY_MS,
    });
    if (comments.length === 0) return { sent: false, comments: 0 };

    const sections = SECTIONS.map(({ status, title }) => ({
      title,
      comments: comments.filter((c) => c.status === status),
    })).filter((s) => s.comments.length > 0);

    const summary = sections
      .map((s) => `${s.comments.length} ${s.title.toLowerCase()}`)
      .join(", ");
    const html = [
      `<p>${comments.length} new comment${comments.length === 1 ? "" : "s"} in the last 24 hours.
        To change a comment's status, edit it in the <a href="${dashboardUrl()}">Convex dashboard</a>.</p>`,
      ...sections.map(
        (s) => `<h3>${s.title} (${s.comments.length})</h3>${s.comments.map(renderComment).join("")}`,
      ),
    ].join("");
    const text = sections
      .map(
        (s) =>
          `${s.title}\n` +
          s.comments
            .map((c) => `- ${c.authorName} on ${c.postTitle}: ${c.body.slice(0, 200)}`)
            .join("\n"),
      )
      .join("\n\n");

    const sent = await sendEmail({
      to,
      subject: `Comments: ${summary}`,
      html,
      text: `${text}\n\nDashboard: ${dashboardUrl()}`,
    });
    return { sent, comments: comments.length };
  },
});
