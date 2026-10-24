export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

function resendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  // EX: "Mark Miro <posts@updates.markmiro.com>". The domain must be verified in Resend.
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("RESEND_API_KEY or EMAIL_FROM is not set; not sending email");
    return null;
  }
  return { apiKey, from };
}

async function post(path: string, apiKey: string, body: unknown) {
  const res = await fetch(`https://api.resend.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

/** Returns false when Resend isn't configured yet. */
export async function sendEmail(email: Email): Promise<boolean> {
  const config = resendConfig();
  if (!config) return false;
  await post("/emails", config.apiKey, { from: config.from, ...email });
  return true;
}

/** Sends up to 100 emails per request. Returns false when Resend isn't configured yet. */
export async function sendEmails(emails: Email[]): Promise<boolean> {
  const config = resendConfig();
  if (!config) return false;
  for (let i = 0; i < emails.length; i += 100) {
    const batch = emails.slice(i, i + 100);
    await post(
      "/emails/batch",
      config.apiKey,
      batch.map((email) => ({ from: config.from, ...email })),
    );
  }
  return true;
}

export function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function siteUrl() {
  return process.env.SITE_URL ?? "https://www.markmiro.com";
}
