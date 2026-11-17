import { checkTheme, type Theme } from "huet";

/*
  A theme made in huet-react's configurator (ThemeConfigurator.tsx). It's
  saved in localStorage with its CSS already computed, so Head.astro can apply
  it before first paint, like a preset from /huet.css. Its `data-huet` id is
  "custom".
*/

export const CUSTOM_PRESET = "custom";
// Head.astro reads these keys too.
const STORAGE_KEY = "huet-custom";
const STYLE_ID = "huet-custom";

export interface CustomTheme {
  name: string;
  theme: Theme;
  /** Its variables for `[data-huet="custom"]`, in both modes. */
  css: string;
}

export function readCustomTheme(): CustomTheme | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    checkTheme(stored?.theme);
    return typeof stored.css === "string" ? stored : null;
  } catch {
    // Missing, or saved by an older huet in another shape.
    return null;
  }
}

/** Saves the theme and applies its CSS to the page. */
export function saveCustomTheme(theme: CustomTheme) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.append(style);
  }
  style.textContent = theme.css;
}
