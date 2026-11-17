import { useEffect, useState } from "react";
import { EmbeddedThemeConfigurator } from "huet-react";
import type { Theme } from "huet";
import isEqual from "lodash/isEqual";
import { presetCss, presets } from "@/lib/palette";
import { CUSTOM_PRESET, readCustomTheme, saveCustomTheme } from "@/lib/customTheme";

/*
  huet-react's embedded theme configurator, in the nav like on huet's demo
  site: a mini map of the current theme that opens a popover with a Themes
  tab and an Edit Theme tab. Picking a theme that matches a preset selects
  that preset, and anything else becomes the custom theme. PresetPicker.astro
  applies the choice when it gets a `huet:select` event.
*/

const html = document.documentElement;

// The site's presets, so the configurator lists them with the site's image
// settings and recognizes them when picked.
const themes = Object.fromEntries(presets.map(({ name, theme }) => [name, theme]));

function currentTheme(): Theme {
  if (html.dataset.huet === CUSTOM_PRESET) {
    const custom = readCustomTheme();
    if (custom) return custom.theme;
  }
  return (presets.find(({ id }) => id === html.dataset.huet) ?? presets[0]).theme;
}

// Where the page's background sits on the neutral ramp: the site only has
// light and dark.
const currentBackground = () => (html.classList.contains("dark") ? 0 : 1);

function select(theme: Theme) {
  const preset = presets.find((preset) => isEqual(preset.theme, theme));
  if (!preset) {
    saveCustomTheme({ name: "Custom", theme, css: presetCss(CUSTOM_PRESET, theme) });
  }
  const id = preset?.id ?? CUSTOM_PRESET;
  window.dispatchEvent(new CustomEvent("huet:select", { detail: id }));
}

export default function ThemePicker() {
  const [theme, setTheme] = useState(currentTheme);
  const [background, setBackground] = useState(currentBackground);

  // Follow the light/dark switch, and themes changed elsewhere.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = currentTheme();
      setTheme((theme) => (isEqual(theme, next) ? theme : next));
      setBackground(currentBackground());
    });
    observer.observe(html, { attributeFilter: ["data-huet", "class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <EmbeddedThemeConfigurator
      mode="outlined"
      value={theme}
      onChange={(next) => {
        setTheme(next);
        select(next);
      }}
      themes={themes}
      background={background}
    />
  );
}
