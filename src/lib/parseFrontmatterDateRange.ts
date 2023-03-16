import { parse } from "date-fns";


export function parseFrontmatterDateRange(dateRange: string) {
  const PARSE_FORMAT = "MMM d, yyyy";

  function split(date: string) {
    let [fr, to] = date.split(/\s*-\s*/);
    // If the year is not specified, use the year of the end date.
    if (!fr.includes(",")) {
      const year = to.split(",")[1].trim();
      fr = `${fr}, ${year}`;
    }
    return [fr, to];
  }

  const [fr, to] = split(dateRange);
  const frDate = parse(fr, PARSE_FORMAT, new Date());
  const toDate = parse(to, PARSE_FORMAT, new Date());
  return [frDate, toDate];
}
