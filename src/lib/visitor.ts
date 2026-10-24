// Visiting /me sets this, so Mark's own visits aren't counted.
const ME_KEY = "mm:me";
const VISITOR_KEY = "mm:visitor";

export function isMe() {
  return localStorage.getItem(ME_KEY) === "1";
}

export function setMe(me: boolean) {
  if (me) localStorage.setItem(ME_KEY, "1");
  else localStorage.removeItem(ME_KEY);
}

/** A random ID per browser, used to remember likes. */
export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Counts a view of a post at most once per browser per day. */
export function recordView(slug: string) {
  // Skips Mark, and headless browsers like the Playwright tests.
  if (isMe() || navigator.webdriver) return;

  const key = `mm:viewed:${slug}`;
  const today = new Date().toDateString();
  if (localStorage.getItem(key) === today) return;
  localStorage.setItem(key, today);

  navigator.sendBeacon(
    `${import.meta.env.PUBLIC_CONVEX_SITE_URL}/view`,
    JSON.stringify({ slug }),
  );
}
