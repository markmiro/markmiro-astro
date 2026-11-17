import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeConfigurator } from "huet-react";
import type { Theme } from "huet";
import isEqual from "lodash/isEqual";
import { presetCss, presets } from "@/lib/palette";
import { CUSTOM_PRESET, readCustomTheme, saveCustomTheme } from "@/lib/customTheme";

/*
  huet-react's theme configurator, opened from the theme picker. It edits the
  current theme: choosing a theme in it that matches a preset selects that
  preset, and anything else becomes the custom theme. PresetPicker.astro
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

function Configurator() {
  const [theme, setTheme] = useState(currentTheme);
  const [background, setBackground] = useState(currentBackground);

  // Follow themes picked in the nav's picker, and the light/dark switch.
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
    <ThemeConfigurator
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

/** Shows the configurator. Returns a function that removes it. */
export function mountConfigurator() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  root.render(<Configurator />);
  return () => {
    root.unmount();
    container.remove();
  };
}
