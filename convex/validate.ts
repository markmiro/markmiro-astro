import { ConvexError } from "convex/values";

// Post slugs come from file names in src/content/posts.
const SLUG = /^[a-z0-9-]{1,100}$/;
const VISITOR_ID = /^[0-9a-f-]{36}$/;
// Deliberately loose; the confirmation email is the real check.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertSlug(slug: string) {
  if (!SLUG.test(slug)) throw new ConvexError("Invalid post.");
}

export function assertVisitorId(visitorId: string) {
  if (!VISITOR_ID.test(visitorId)) throw new ConvexError("Invalid visitor.");
}

export function isEmail(email: string) {
  return email.length <= 254 && EMAIL.test(email);
}
