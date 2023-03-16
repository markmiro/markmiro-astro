import type { MDXInstance } from "astro";
import { getUnixTime } from "date-fns";
import { parseFrontmatterDateRange } from "./parseFrontmatterDateRange";

export function compareFrontmatterDateRangeDesc(
  a: MDXInstance<Frontmatter>,
  b: MDXInstance<Frontmatter>
) {
  // fr (from) to (to)
  const [_aFr, aTo] = parseFrontmatterDateRange(a.frontmatter.date);
  const [_bFr, bTo] = parseFrontmatterDateRange(b.frontmatter.date);
  return getUnixTime(bTo) - getUnixTime(aTo);
}

export function compareFrontmatterDateDesc(
  a: MDXInstance<Frontmatter>,
  b: MDXInstance<Frontmatter>
) {
  // fr (from) to (to)
  const [aDate] = parseFrontmatterDateRange(a.frontmatter.date);
  const [bDate] = parseFrontmatterDateRange(b.frontmatter.date);
  return getUnixTime(bDate) - getUnixTime(aDate);
}