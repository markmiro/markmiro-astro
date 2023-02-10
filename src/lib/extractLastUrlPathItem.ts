import _ from "lodash";

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
  return tokens[tokens.length - 1];
  const nonEmpty = _.filter(tokens, (section) => section !== "");
  return _.last(nonEmpty);
}
