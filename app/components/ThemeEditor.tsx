"use client";

import type { ThemeName } from "app/theme/themes";
import useGlobalStore from "app/store/globalStore";
import { themes } from "app/theme/themes";
import clsx from "clsx";
import { useTheme } from "next-themes";
import React from "react";

/** Applies CSS vars whenever `themeName` or color-scheme changes */
function useApplyTheme(themeName: ThemeName | undefined) {
  const { resolvedTheme } = useTheme();
  React.useEffect(() => {
    if (!themeName) return;

    const palette =
      themes[themeName][resolvedTheme === "dark" ? "dark" : "light"];
    Object.entries(palette).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [themeName, resolvedTheme]);
}

export default function ThemeEditor() {
  const { setCurrentThemeName, currentThemeName } = useGlobalStore();

  useApplyTheme(
    themes[currentThemeName as ThemeName]
      ? (currentThemeName as ThemeName)
      : undefined,
  );

  const swatch = (name: ThemeName) => (
    <button
      key={name}
      onClick={() => setCurrentThemeName(name)}
      className={clsx(
        "h-6 w-6 rounded-full border",
        name === currentThemeName && "ring-2 ring-primary",
      )}
      style={{ backgroundColor: `hsl(${themes[name].light["--primary"]})` }}
      aria-label={name}
    />
  );

  return (
    <div className="flex items-center gap-2">
      {(["red", "blue", "yellow"] as ThemeName[]).map(swatch)}
    </div>
  );
}
