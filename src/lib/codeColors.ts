import { hues, type Hue } from "huet";

/*
  Syntax colors for code blocks. huet's tokens are solved for strong contrast
  (APCA), which on a mid-tone block, like Blueprint's dark blue, leaves only
  pastels. Its classic relative solver keeps each hue's color but can drop
  below readable contrast. For each hue, this takes the more colorful of the
  two, blended back toward the token only as far as it needs to stay at 3:1
  against the block. Code text and comments keep huet's tokens.
*/

const MIN_CONTRAST = 3;

type Triple = [number, number, number];

const linear = (hex: string): Triple =>
  [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as Triple;

const luminance = (hex: string) => {
  const [r, g, b] = linear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const toOklab = (hex: string): Triple => {
  const [r, g, b] = linear(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const fromOklab = ([L, a, b]: Triple) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    "#" +
    rgb
      .map((c) => {
        const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
        return Math.round(Math.min(1, Math.max(0, v)) * 255)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
};

const chroma = (hex: string) => Math.hypot(...toOklab(hex).slice(1));

function mix(from: string, to: string, amount: number) {
  const [a, b] = [toOklab(from), toOklab(to)];
  return fromOklab(a.map((x, i) => x + (b[i] - x) * amount) as Triple);
}

/**
 * The most colorful readable syntax color per hue, given huet's `tokens` and
 * the classic solver's `vivid` colors on the same `block`.
 */
export function codeColors(
  block: string,
  tokens: Record<Hue, string>,
  vivid: Record<Hue, string>,
) {
  return Object.fromEntries(
    hues.map((hue) => {
      const token = tokens[hue];
      if (chroma(vivid[hue]) <= chroma(token)) return [hue, token];
      // Step from the vivid end back toward the token until it's readable.
      for (let amount = 1; amount > 0; amount -= 0.05) {
        const color = mix(token, vivid[hue], amount);
        if (contrast(block, color) >= MIN_CONTRAST) return [hue, color];
      }
      return [hue, token];
    }),
  ) as Record<Hue, string>;
}
