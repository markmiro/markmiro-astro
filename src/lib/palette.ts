import { hues, themes, type Hue, type Theme } from "huet";
import { resolveTheme, themeVariables, type ResolvedTheme } from "huet/internal";
import { codeColors } from "./codeColors";

/*
  The site's colors come from huet (github:markmiro/huet#dist): each one is a
  contrast against the page background rather than a fixed hex. `--c60` is
  "60% contrast from the background", so it's dark gray on a light page and
  light gray on a dark one. Dark mode is the same theme with the background at
  the dark end of its neutral ramp, which flips every contrast.

  Every preset is computed in both modes at build time and served as one
  stylesheet (see pages/huet.css.ts), so switching presets is just changing
  `data-huet` on <html>. Images are recolored in the browser (recolorImages.ts).
*/

/** Contrast steps available as `c{n}` colors, e.g. `text-c60`, `border-c12`. */
export const CONTRASTS = [0, 4, 8, 12, 20, 30, 45, 60, 75, 90, 100] as const;

export interface Preset {
  id: string;
  name: string;
  /** The huet theme, as huet-react's configurator edits it. */
  theme: Theme;
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Images go halfway to the theme, with saturated colors keeping their own
// hue, unless a theme sets its own. The configurator's image sliders edit it.
const IMAGES = { strength: 0.5, tint: 0 };

export const presets: Preset[] = Object.entries(themes).map(([name, theme]) => ({
  id: slug(name),
  name,
  theme: { images: IMAGES, ...theme },
}));

// Base: black to white with huet's default hues. Those are the ramps images
// are assumed to be in, so recoloring into it changes nothing and is skipped.
export const DEFAULT_PRESET = "base";

export function presetVars(theme: Theme, dark: boolean) {
  const resolved = resolveTheme(theme, { background: dark ? 0 : 1 });
  const { root } = resolved;
  const tokens = resolved.tokens();
  const vars: Record<string, string> = {};

  for (const amount of CONTRASTS) {
    vars[`--c${amount}`] = resolved.step(root, amount).hex;
  }
  // Signal colors readable as text on the page, plus fills that keep their
  // own readable text (`on-*`) and faint tints (`*-soft`).
  for (const hue of hues as readonly Hue[]) {
    const fill = resolved.surface(resolved.background, hue);
    vars[`--${hue}`] = tokens[hue];
    vars[`--${hue}-fill`] = fill;
    vars[`--on-${hue}`] = resolved.tokens(fill, resolved.background).foreground;
    vars[`--${hue}-soft`] = resolved.step(root, 15, hue).hex;
  }
  // The ends of the neutral ramp, whichever mode is on. Shadows use black.
  vars["--black"] = resolved.dark;
  vars["--white"] = resolved.light;
  Object.assign(vars, miniMapVars(resolved), codeBlockVars(resolved));
  return vars;
}

/**
 * The `--huet-*` variables huet's Shiki theme colors code with (see
 * astro.config.mjs), solved for readable contrast against the code block,
 * with more colorful syntax colors (codeColors.ts).
 * Blocks follow the mode, a step off the page background: light on a light
 * page, dark on a dark one. This is what huet's mountTheme would set on a
 * `huet-bg-5` block, its default for code, computed ahead of time.
 */
function codeBlockVars(theme: ResolvedTheme) {
  const block = theme.step(theme.root, 5);
  const tokens = theme.tokens(block.hex, theme.background);
  const vivid = Object.fromEntries(
    hues.map((hue) => [hue, theme.step(block, 100, hue).hex]),
  ) as Record<Hue, string>;
  const colors = codeColors(block.hex, tokens, vivid);
  return {
    ...themeVariables(tokens),
    "--huet-foreground": theme.step(block, 100).hex,
    ...Object.fromEntries(hues.map((hue) => [`--huet-${hue}`, colors[hue]])),
  };
}

// Mini map pill stops, from full contrast down to the background itself.
const PILL_CONTRASTS = [100, 87.5, 75, 62.5, 50, 37.5, 25, 12.5, 0];

/**
 * huet-react's theme mini map (ThemeMiniMap.tsx), for the preset picker: each
 * hue at full contrast as a dot, furthest from the background's lightness
 * first (`--dot-1` to `--dot-5`), over a pill of the neutral ramp in the same
 * direction.
 */
function miniMapVars(theme: ResolvedTheme) {
  const { root } = theme;
  const dots = hues
    .map((hue) => theme.step(root, 100, hue))
    .map(({ hex, L }) => ({ color: hex, distance: Math.abs(L - root.L) }))
    .sort((a, b) => b.distance - a.distance);
  const vars: Record<string, string> = {};
  dots.forEach(({ color }, i) => (vars[`--dot-${i + 1}`] = color));
  const stops = PILL_CONTRASTS.map((amount) => theme.step(root, amount).hex);
  vars["--neutral-pill"] = `linear-gradient(to right, ${stops.join(", ")})`;
  return vars;
}

function rule(selector: string, vars: Record<string, string>) {
  const body = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

/**
 * CSS for a theme in both modes. It applies to whatever has its `data-huet`
 * attribute, so the picker's options can preview each one.
 */
export function presetCss(id: string, theme: Theme) {
  const attr = `[data-huet="${id}"]`;
  const light = id === DEFAULT_PRESET ? `:root, ${attr}` : attr;
  return [
    rule(light, presetVars(theme, false)),
    rule(`.dark${attr}, .dark ${attr}`, presetVars(theme, true)),
  ].join("\n\n");
}

export function presetsCss() {
  return presets.map(({ id, theme }) => presetCss(id, theme)).join("\n\n");
}
