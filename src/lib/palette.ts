import {
  createTheme,
  hues,
  themeVariables,
  type Hue,
  type NeutralRamp,
} from "huet";
import { themeConfigs, type ThemeConfig } from "huet/config";
import type { Palette } from "huet/images";
import { codeColors } from "./codeColors";

/*
  The site's colors come from huet (github:markmiro/huet#dist): each one is a
  contrast against the page background rather than a fixed hex. `--c60` is
  "60% contrast from the background", so it's dark gray on a light page and
  light gray on a dark one. Dark mode is the same preset with the background at
  the dark end of its neutral ramp, which flips every contrast.

  Every preset is computed in both modes at build time and served as one
  stylesheet (see pages/huet.css.ts), so switching presets is just changing
  `data-huet` on <html>. Images are recolored in the browser (recolorImages.ts).
*/

/** Contrast steps available as `c{n}` colors, e.g. `text-c60`, `border-c12`. */
export const CONTRASTS = [0, 4, 8, 12, 20, 30, 45, 60, 75, 90, 100] as const;

/** A preset's ramps, which is all the colors and image recoloring need. */
export type PresetPalette = Palette & { neutral: NeutralRamp };

export interface Preset {
  id: string;
  name: string;
  /** The theme config it comes from, for huet-react's configurator. */
  config: ThemeConfig;
  palette: PresetPalette;
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * Ports a huet theme config the way its recolor demo does: the gray ramp
 * becomes the neutral ramp and the pallet's hues become the anchors. The
 * config's background position is left out, since the site's light and dark
 * modes set it.
 */
export function paletteFromConfig({ pallet, ramps }: ThemeConfig): PresetPalette {
  return {
    neutral: {
      colors: (ramps.gray?.colors ?? ["black", "white"]).map(
        (stop) => pallet[stop] ?? stop,
      ),
      colorModel: ramps.gray?.colorModel ?? "lab",
    },
    colors: Object.fromEntries(hues.map((hue) => [hue, pallet[hue]])),
  };
}

export const presets: Preset[] = themeConfigs
  // "Base Inverted" is Base in dark mode, which every preset already has.
  .filter(({ name }) => name !== "Base Inverted")
  .map((config) => ({
    id: slug(config.name ?? ""),
    name: config.name ?? "",
    config,
    palette: paletteFromConfig(config),
  }));

// Base: black to white with huet's default hues. Those are the ramps images
// are assumed to be in, so recoloring into it changes nothing and is skipped.
export const DEFAULT_PRESET = "base";

export function presetVars(palette: PresetPalette, dark: boolean) {
  const theme = createTheme({ ...palette, background: dark ? 0 : 1 });
  const tokens = theme.tokens();
  const vars: Record<string, string> = {};

  for (const amount of CONTRASTS) {
    vars[`--c${amount}`] = theme.relative.contrast(amount).hex;
  }
  // Signal colors readable as text on the page, plus fills that keep their
  // own readable text (`on-*`) and faint tints (`*-soft`).
  for (const hue of hues as readonly Hue[]) {
    const ramp = theme.relative.theme.ramps[hue];
    const fill = theme.surface(theme.background, hue);
    vars[`--${hue}`] = tokens[hue];
    vars[`--${hue}-fill`] = fill;
    vars[`--on-${hue}`] = theme.tokens(fill, theme.background).foreground;
    vars[`--${hue}-soft`] = theme.relative.contrast(15, ramp).hex;
  }
  // The ends of the neutral ramp, whichever mode is on. Shadows use black.
  vars["--black"] = theme.dark;
  vars["--white"] = theme.light;
  Object.assign(vars, miniMapVars(theme), codeBlockVars(theme));
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
function codeBlockVars(theme: ReturnType<typeof createTheme>) {
  const block = theme.relative.contrast(5);
  const tokens = theme.tokens(block.hex, theme.background);
  const vivid = Object.fromEntries(
    hues.map((hue) => [hue, block.contrast(100, block.theme.ramps[hue]).hex]),
  ) as Record<Hue, string>;
  const colors = codeColors(block.hex, tokens, vivid);
  return {
    ...themeVariables(tokens),
    "--huet-foreground": block.contrast(100).hex,
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
function miniMapVars(theme: ReturnType<typeof createTheme>) {
  const bg = theme.relative;
  const dots = hues
    .map((hue) => bg.contrast(100, bg.theme.ramps[hue]))
    .map(({ hex, lab }) => ({ color: hex, distance: Math.abs(lab[0] - bg.lab[0]) }))
    .sort((a, b) => b.distance - a.distance);
  const vars: Record<string, string> = {};
  dots.forEach(({ color }, i) => (vars[`--dot-${i + 1}`] = color));
  const stops = PILL_CONTRASTS.map((amount) => bg.contrast(amount).hex);
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
 * CSS for a preset in both modes. It applies to whatever has its `data-huet`
 * attribute, so the picker's options can preview each one.
 */
export function presetCss(id: string, palette: PresetPalette) {
  const attr = `[data-huet="${id}"]`;
  const light = id === DEFAULT_PRESET ? `:root, ${attr}` : attr;
  return [
    rule(light, presetVars(palette, false)),
    rule(`.dark${attr}, .dark ${attr}`, presetVars(palette, true)),
  ].join("\n\n");
}

export function presetsCss() {
  return presets.map(({ id, palette }) => presetCss(id, palette)).join("\n\n");
}
