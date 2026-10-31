import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeConfigurator } from "huet-react";
import type { ThemeConfig } from "huet/config";
import isEqual from "lodash/isEqual";
import { paletteFromConfig, presetCss, presets } from "@/lib/palette";
import { CUSTOM_PRESET, readCustomTheme, saveCustomTheme } from "@/lib/customTheme";

/*
  huet-react's theme configurator, opened from the theme picker. It edits the
  current theme: choosing a theme in it that matches a preset selects that
  preset, and anything else becomes the custom theme. PresetPicker.astro
  applies the choice when it gets a `huet:select` event.
*/

const html = document.documentElement;

function currentConfig(): ThemeConfig {
  if (html.dataset.huet === CUSTOM_PRESET) {
    const custom = readCustomTheme();
    if (custom) return custom.config;
  }
  return (presets.find(({ id }) => id === html.dataset.huet) ?? presets[0]).config;
}

function select(config: ThemeConfig) {
  const preset = presets.find((preset) => isEqual(preset.config, config));
  if (!preset) {
    const palette = paletteFromConfig(config);
    saveCustomTheme({
      name: config.name || "Custom",
      config,
      palette,
      css: presetCss(CUSTOM_PRESET, palette),
    });
  }
  const id = preset?.id ?? CUSTOM_PRESET;
  window.dispatchEvent(new CustomEvent("huet:select", { detail: id }));
}

function Configurator() {
  const [config, setConfig] = useState(currentConfig);

  // Follow themes picked in the nav's picker.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = currentConfig();
      setConfig((config) => (isEqual(config, next) ? config : next));
    });
    observer.observe(html, { attributeFilter: ["data-huet"] });
    return () => observer.disconnect();
  }, []);

  return (
    <ThemeConfigurator
      value={config}
      onChange={(next) => {
        setConfig(next);
        select(next);
      }}
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
