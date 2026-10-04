import { getUnixTime } from "date-fns";
import { parse } from "date-fns";

import _ from "lodash";

type Dated = { data: { date: string } };

export function parseFrontmatterDateRange(dateRange: string) {
  const PARSE_FORMAT = "MMM d, yyyy";

  function split(date: string) {
    let [fr, to] = date.split(/\s*-\s*/);
    // If the year is not specified, use the year of the end date.
    if (!fr.includes(",")) {
      const year = to.split(",")[1].trim();
      fr = `${fr}, ${year}`;
    }
    if (!to) to = fr;
    return [fr, to];
  }

  const [fr, to] = split(dateRange);
  const frDate = parse(fr, PARSE_FORMAT, new Date());
  const toDate = parse(to, PARSE_FORMAT, new Date());

  if (!toDate) return [frDate, frDate];

  return [frDate, toDate];
}

export function compareFrontmatterDateRangeDesc(a: Dated, b: Dated) {
  // fr (from) to (to)
  const [_aFr, aTo] = parseFrontmatterDateRange(a.data.date);
  const [_bFr, bTo] = parseFrontmatterDateRange(b.data.date);
  return getUnixTime(bTo) - getUnixTime(aTo);
}

export function compareFrontmatterDateDesc(a: Dated, b: Dated) {
  // fr (from) to (to)
  const [aDate] = parseFrontmatterDateRange(a.data.date);
  const [bDate] = parseFrontmatterDateRange(b.data.date);
  return getUnixTime(bDate) - getUnixTime(aDate);
}

/**
 * EX: https://www.example.com/one/two/three?query=string
 * returns "three"
 */
export function extractLastUrlPathItem(url?: URL | string) {
  if (!url) return "";
  // Adding a base URL to prevent the browser from throwing an error.
  // We don't care about the base URL, just the path.
  const baseUrl = "https://example.com";
  const tokens = new URL(url, baseUrl).pathname.split("/");
  const nonEmpty = _.filter(tokens, (section) => section !== "");
  return _.last(nonEmpty);
}
